import * as fs from "fs"

const watchers = {};
export function watchFile(file: string): Watcher {

    const existing = watchers[file];
    if (existing)
        return existing;
    else {
        const watcher = new Watcher(file);
        watcher.start();

        return watchers[file] = watcher;
    }
}

type ChangeObserver<T> = (value: T) => any;

class Watcher {
    private observers: ChangeObserver<string>[] = [];

    constructor(public file: string, public interval: number = 100) {
    }

    subscribe(observer: ChangeObserver<string>, id) {
        const { observers } = this;
        observers.push(observer);
        console.log("[" + id + "] observers count: " + observers.length);

        return {
            unsubscribe() {
                const idx = observers.indexOf(observer);
                if (idx >= 0 && observers[idx] === observer) {
                    observers.splice(idx, 1);
                    console.log("[" + id + "] unsubscribe");
                }
            }
        }
    }

    start() {
        const { observers, file } = this;
        fs.watchFile(file, { interval: this.interval }, listener);
        return {
            unsubscribe() {
                fs.unwatchFile(file, listener);
            }
        }
        function listener() {
            console.debug("File changed: " + file);
            for (var i = 0; i < observers.length; i++) {
                observers[i](file);
            }
        }
    }
}