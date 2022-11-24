import {message} from 'antd';
import {RequestArguments, BaseProvider} from '@metamask/providers/dist/BaseProvider';
import {Maybe} from '@metamask/providers/dist/utils';

type EtherRequest<T> = (args: RequestArguments) => Promise<Maybe<T>>;

export const apiWrapper = function<T> (fn: EtherRequest<T>, opts: RequestArguments) {
    return fn(opts).catch((ret) => {
        message.error((ret || {}).message || 'something wrong with your network');
    });
};