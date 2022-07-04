import log from '../src/Logger'

const info = (namespace: string, message: string, object?: any) => {
    if (object) {

        log.info(`[${namespace}] ${message}]`, object);
        // console.info(`[${namespace}] ${message}`, object);
    } else {
        log.info(`[${namespace}] ${message}`);
    }
};

const warn = (namespace: string, message: string, object?: any) => {
    if (object) {
        // console.warn(`[WARN] [${namespace}] ${message}`, object);
        log.warn(`[${namespace}] ${message}`, object);
    } else {
        log.warn(`[${namespace}] ${message}`);
    }
};

const error = (namespace: string, message: string, object?: any) => {
    if (object) {
        log.error(`[${namespace}] ${message}`, object);
    } else {
        log.error(`[${namespace}] ${message}`);
    }
};

const debug = (namespace: string, message: string, object?: any) => {
    if (object) {
        log.debug(`[${namespace}] ${message}`, object);
    } else {
        log.debug(`[${namespace}] ${message}`);
    }
};


export default {
    info,
    warn,
    error,
    debug
};
