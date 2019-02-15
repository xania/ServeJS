import { Application } from 'express';
// import * as passport from 'passport';
// import * as auth from './auth';
import * as graph from './graph';
import {ExchangeCredentials, ExchangeService, Uri, AutodiscoverService, Folder, Item, ExchangeVersion} from "ews-javascript-api";
import * as ews from "ews-javascript-api"
import { WebCredentials } from "ews-javascript-api/js/Credentials/WebCredentials"


export function config(app: Application) {
    // authentication setup
    const callback = (iss, sub, profile, accessToken, refreshToken, params, done) => {
        done(null, {
            profile,
            accessToken,
            refreshToken,
            params
        });
    };

    function loadBodyText(exch: ExchangeService, items: Item[]) {
        if(items.length <= 0)
            return Promise.resolve();
        const getItemsPropertySet = new ews.PropertySet(ews.BasePropertySet.FirstClassProperties);
        getItemsPropertySet.RequestedBodyType = ews.BodyType.Text;

        return exch.LoadPropertiesForItems(items, getItemsPropertySet);
    }

    app.get('/api/exchange/item/*', async (req, res, next) => {
        try {
            res.setHeader("Content-Type", "text/javascript");
            const exchangeVersion = ExchangeVersion.Exchange2016;
            var exch = new ExchangeService(exchangeVersion);
            exch.Url = new ews.Uri("https://outlook.office365.com/Ews/Exchange.asmx"); // you can also use exch.AutodiscoverUrl
            exch.Credentials = new WebCredentials(userName(), password());

            var findItemView = new ews.ItemView(1);
            findItemView.PropertySet = new ews.PropertySet(ews.BasePropertySet.IdOnly);
            const findItemsResult = await exch.FindItems(ews.WellKnownFolderName.Inbox, null, findItemView)

            await loadBodyText(exch, findItemsResult.Items);

            res.write(JSON.stringify({
                totalCount: findItemsResult.TotalCount,
                nextPageOffset: findItemsResult.NextPageOffset,
                items: findItemsResult.Items.map(itemToJson)
            }));
        }
        catch(ex) {
            console.log("error")
            console.log(ex);
        }
        res.end();
    });
    
    app.get('/api/exchange/inbox/:term?', async (req, res, next) => {
        try {
            res.setHeader("Content-Type", "text/javascript");
            const exchangeVersion = ExchangeVersion.Exchange2016;
            var exch = new ExchangeService(exchangeVersion);
            exch.Url = new ews.Uri("https://outlook.office365.com/Ews/Exchange.asmx"); // you can also use exch.AutodiscoverUrl
            exch.Credentials = new WebCredentials(userName(), password());
            const r = await exch.FindItems(ews.WellKnownFolderName.Inbox, req.params.term, new ews.ItemView(20))
            await loadBodyText(exch, r.Items);
            
            res.write(JSON.stringify({
                totalCount: r.TotalCount,
                nextPageOffset: r.NextPageOffset,
                items: r.Items.map(itemToJson)
            }));
        }
        catch(ex) {
            console.log("error")
            console.log(ex);
        }
        res.end();
    });

    app.get('/api/exchange/settings', async (req, res, next) => {
        try {
            res.setHeader("Content-Type", "text/javascript");
            const exchangeVersion = ExchangeVersion.Exchange2016;
            var exch = new ExchangeService(exchangeVersion);
            var autod = new AutodiscoverService(new Uri("https://autodiscover-s.outlook.com/autodiscover/autodiscover.svc"), exchangeVersion);
            autod.Credentials = new WebCredentials(userName(), password());
            var settingNames = [
                ews.UserSettingName.InternalEwsUrl,
                ews.UserSettingName.ExternalEwsUrl,
                ews.UserSettingName.UserDisplayName,
                ews.UserSettingName.UserDN,
                ews.UserSettingName.EwsPartnerUrl,
                ews.UserSettingName.DocumentSharingLocations,
                ews.UserSettingName.MailboxDN,
                ews.UserSettingName.ActiveDirectoryServer,
                ews.UserSettingName.CasVersion,
                ews.UserSettingName.ExternalWebClientUrls,
                ews.UserSettingName.ExternalImap4Connections,
                ews.UserSettingName.AlternateMailboxes
            ];
            const settings = await autod.GetUserSettings(["ib@ridercorp.com"], settingNames);      
            
            const result = settings.Responses.map(r => ({
                smtpAddress: r.SmtpAddress,
                settings: Object.keys(r.Settings).map(k => ({ [ews.UserSettingName[k]] : r.Settings[k]})).reduce( (x, y) => Object.assign({}, x, y), {})
             }))

            res.write(JSON.stringify(result));
            res.end();
        } catch (ex) {
            console.log(ex);
            res.end();
        }
    });

    // passport.use(new OIDCStrategy(config.creds, callback));
//     app.get('/api/graph', async (req, res, next) => {
//         try {
//             res.setHeader("Content-Type", "text/javascript");


// // Get an access token for the app.
//             auth.getAccessToken().then(function (token) {
//                 // Get all of the users in the tenant.
//                 graph.getUsers(token)
//                     .then(function (users) {
//                         // Create an event on each user's calendar.
//                         // graph.createEvent(token, users);
//                         res.end();
//                     }, error => {
//                         console.error('>>> Error getting users: ' + error);
//                         res.end();
//                     });
//             }, (error) => {
//                 console.error('>>> Error getting access token: ' + error);
//                 res.end();
//             });

//             res.end();
//         }
//         catch (ex) {
//             console.log(ex);
//             res.end();
//         }
//         // // Get an access token for the app.
//         // auth.getAccessToken().then(function (token) {
//         //     // Get all of the users in the tenant.
//         //     graph.getUsers(token)
//         //         .then(function (users) {
//         //             // Create an event on each user's calendar.
//         //             // graph.createEvent(token, users);
//         //             res.end();
//         //         }, function (error) {
//         //             console.error('>>> Error getting users: ' + error);
//         //             res.end();
//         //         });
//         // }, function (error) {
//         //     console.error('>>> Error getting access token: ' + error);
//         //     res.end();
//         // });

//     });
}

function userName() {
    return "user";
}
function password() {
    return "password";
}

function itemToJson(item: Item) {
    return {
        subject: item.Subject,
        dateTimeSent: toUTCString(item.DateTimeSent),
        dateTimeReceived: toUTCString(item.DateTimeReceived),
        dateTimeCreated: toUTCString(item.DateTimeCreated),
        isFromMe: item.IsFromMe,
        id: item.Id,
        from: from(item),
        text: text(item),
        isDirty: isRead(item),
        preview: property(item, ews.EmailMessageSchema.UniqueBody),
        // textBody: item.TextBody,
        storeEntryId: item.StoreEntryId
    }
}

function toUTCString(date: ews.DateTime) {
    return ews.DateTime.DateTimeToXSDateTime(date);
    // const utc = date.ToUniversalTime();
    // return `${utc.Year}-${utc.Month}-${utc.Day}T${utc.Hour}:${utc.Minute}Z`;
}

function from(item: Item) {
    var out: {outValue : any} = { outValue: null };
    return item.TryGetProperty(ews.EmailMessageSchema.From, out) ? { name: out.outValue.name, address: out.outValue.address } : null;
}

function isRead(item: Item) {
    var out: {outValue : any} = { outValue: null };
    return item.TryGetProperty(ews.EmailMessageSchema.IsRead, out) ? out.outValue : null;
}

function property(item: Item, property: ews.PropertyDefinition) {
    var out: {outValue : any} = { outValue: null };
    return item.TryGetProperty(property, out) ? out.outValue : null;
}

function text(item: Item) {
    try {
        return item.Body.Text
    } catch {
        return "---";
    }
}
