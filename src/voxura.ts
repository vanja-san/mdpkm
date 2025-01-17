import { t } from 'i18next';
import CheckCircle from '~icons/bi/check-circle';
import DownloadIcon from '~icons/bi/download';
import { useMemo, useState, useEffect } from 'react';

import { APP_DIR } from './util/constants';
import { Download } from '../voxura/src/downloader';
import type Account from '../voxura/src/auth/account';
import mdpkmPlatform from './mdpkm/platform';
import { toast, getDefaultInstanceIcon } from './util';
import { Voxura, Instance, ComponentVersions, VersionedComponent } from '../voxura';

Object.defineProperty(Instance.prototype, 'defaultIcon', {
	get: function() {
		return getDefaultInstanceIcon(this.name);
	}
})

const voxura = new Voxura(APP_DIR);
voxura.addPlatform(mdpkmPlatform);

const hiddenDownloads = ['', 'component_library'];
voxura.downloader.listenForEvent('downloadStarted', (download: Download) => {
	if (hiddenDownloads.indexOf(download.id) === -1)
    	toast('download_started', [t(`mdpkm:download.${download.id}`, download.extraData)], DownloadIcon);
});
voxura.downloader.listenForEvent('downloadFinished', (download: Download) => {
    if (hiddenDownloads.indexOf(download.id) === -1)	
		toast('download_finished', [t(`mdpkm:download.${download.id}`, download.extraData)], CheckCircle);
});

export function useAccounts(): Account[] {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => voxura.auth.listenForEvent('accountsChanged', callback),
        getCurrentValue: () => voxura.auth.accounts
    }), []);
    return useSubscription(subscription);
}
export function useCurrentAccount(): Account | undefined {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => voxura.auth.listenForEvent('selectedChanged', callback),
        getCurrentValue: () => voxura.auth.getCurrent()
    }), []);
    return useSubscription(subscription);
}

export function useInstance(id: string) {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => {
            const instance = voxura.getInstance(id);
            if (instance)
                return instance.listenForEvent('changed', callback);
            return voxura.instances.listenForEvent('listChanged', callback);
        },
        getCurrentValue: () => voxura.getInstance(id)
    }), [id]);
    return useSubscription(subscription);
}
export function useInstances() {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => voxura.instances.listenForEvent('listChanged', callback),
        getCurrentValue: () => voxura.instances.getAll()
    }), []);
    return useSubscription(subscription);
}
export function useRecentInstances() {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => voxura.instances.listenForEvent('listChanged', callback),
        getCurrentValue: () => voxura.instances.getRecent()
    }), []);
    return useSubscription(subscription);
}

export function useDownloads() {
    const subscription = useMemo(() => ({
        subscribe: (callback: any) => voxura.downloader.listenForEvent('changed', callback),
        getCurrentValue: () => voxura.downloader.downloads
    }), []);
    return useSubscription(subscription);
}

export function useComponentVersions(component?: VersionedComponent | typeof VersionedComponent) {
    const [value, setValue] = useState<ComponentVersions | null>(null);
    useEffect(() => {
		if (component?.getVersions) {
			setValue(null);
			component?.getVersions().then(setValue);
		} else
			setValue([]);
    }, [component]);
    return value;
}

function useSubscription<T>({ subscribe, getCurrentValue }: {
    subscribe: (callback: Function) => () => void,
    getCurrentValue: () => T
}): T {
    const [state, setState] = useState(() => ({
        getCurrentValue,
        subscribe,
        value: getCurrentValue(),
    }));

    let valueToReturn = state.value;
    if (state.getCurrentValue !== getCurrentValue || state.subscribe !== subscribe) {
        valueToReturn = getCurrentValue();

        setState({
            getCurrentValue,
            subscribe,
            value: valueToReturn,
        });
    }

    useEffect(() => {
        let didUnsubscribe = false;
        const checkForUpdates = () => {
            if (didUnsubscribe)
                return;
            setState(prevState => {
                if (prevState.getCurrentValue !== getCurrentValue || prevState.subscribe !== subscribe)
                    return prevState;
                const value = getCurrentValue();
                /*if (prevState.value === value)
                    return prevState;*/

                return { ...prevState, value };
            });
        };
        const unsubscribe = subscribe(checkForUpdates);
        checkForUpdates();

        return () => {
            didUnsubscribe = true;
            unsubscribe();
        };
    }, [getCurrentValue, subscribe]);
    return valueToReturn;
}

(globalThis as any).voxura = voxura;
export default voxura;