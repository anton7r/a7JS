declare module "a7js" {
    export function routes(routes:object):void;
    export function createElement(element:string, attributes:object):HTMLElement;
    export function registerComponent(name:string, obj:object):void;
    export function path(newPath:undefined|string):void;
    export function sanitizer(str:string):string;
}