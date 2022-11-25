import React, {useEffect, useState} from 'react';
import {message, Button, Spin} from 'antd';
import {apiWrapper} from '@/utils';
import {ethers} from 'ethers';
import {ExternalProvider} from '@ethersproject/providers/src.ts/web3-provider';

const ABI: string[] = []; // test
const AuctionContractAddress = '0xBa5bF3b645Fe778c44e698812ac181Da39EC88C4'; // test

const Home: React.FC = () => {
    const [currentAccount, setCurrentAccount] = useState<string | undefined>('');
    const [initLoad, setInitLoad] = useState<boolean>(true);
    const [loginLoad, setLoginLoad] = useState<boolean>(false);

    const {ethereum} = window;

    const checkAccount = async () => {
        if (!ethereum) {
            message.error({
                content: 'Make sure you have MetaMask'
            });
            return;
        }
        apiWrapper<string []>(
            ethereum.request,
            {method: 'eth_accounts'}
        ).then((accounts) => {
            if (accounts && accounts.length !== 0){
                const account = accounts[0];
                setCurrentAccount(account);
            }
        }).finally(() => {
            setInitLoad(false);
        });
    };

    async function initializeProvider() {
        if (!ethereum) {
            return;
        }
        const provider = new ethers.providers.Web3Provider(ethereum as unknown as ExternalProvider);
        const signer = provider.getSigner();
        return new ethers.Contract(AuctionContractAddress, ABI, signer);
    }

    const handleLogin = () => {
        const {ethereum} = window;
        if (!ethereum) {
            message.error({
                content: 'Make sure you have MetaMask'
            });
            return;
        }
        setLoginLoad(true);
        apiWrapper<string []>(
            ethereum.request,
            {method: 'eth_requestAccounts'}
        ).finally(() => {
            setLoginLoad(false);
        });
    };

    const registListener = () => {
        ethereum?.on('accountsChanged', (accounts) => {
            if (!(accounts instanceof Array)) {
                return;
            }
            if (accounts.length === 0) {
                setCurrentAccount('');
                message.success('byebye');
                return;
            }
            setCurrentAccount(accounts[0]);
            message.success('welcome!');
        });
    };

    const cancelListener = () => {
        ethereum?.removeAllListeners('accountsChanged');
    };

    useEffect(() => {
        checkAccount();
        registListener();
        return () => {
            cancelListener();
        };
    }, [ethereum]);

    const renderLoggedInContent = () => {
        return (
            <div>
                <div>
                    Hello {currentAccount} !
                </div>
            </div>
        );
    };

    const renderLoggedOutContent = () => {
        return <Button loading={loginLoad} onClick={handleLogin}>connect to the wallet</Button>;
    };

    const renderContent = () => {
        return currentAccount
            ? renderLoggedInContent()
            : renderLoggedOutContent();
    };

    return (
        <div>
            {initLoad
                ? <Spin />
                : renderContent()
            }
        </div>
    );
};

export default Home;
