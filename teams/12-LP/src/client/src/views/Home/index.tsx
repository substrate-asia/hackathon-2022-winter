import React, {useEffect, useState} from 'react';
import {message, Button, Spin} from 'antd';

const Home: React.FC = () => {
    const [currentAccount, setCurrentAccount] = useState<string | undefined>('');
    const [initLoad, setInitLoad] = useState<boolean>(true);
    const [loginLoad, setLoginLoad] = useState<boolean>(false);
    const checkAccount = async () => {
        const {ethereum} = window;
        if (!ethereum) {
            message.error({
                content: 'Make sure you have MetaMask'
            });
            return;
        }
        ethereum.request<string []>({method: 'eth_accounts'}).then((accounts) => {
            if (accounts && accounts.length !== 0){
                const account = accounts[0];
                setCurrentAccount(account);
            }
        }).finally(() => {
            setInitLoad(false);
        });
    };

    const handleLogin = () => {
        const {ethereum} = window;
        if (!ethereum) {
            message.error({
                content: 'Make sure you have MetaMask'
            });
            return;
        }
        setLoginLoad(true);
        ethereum.request<string []>({method: 'eth_requestAccounts'}).then((accounts) => {
            if (accounts && accounts.length !== 0){
                const account = accounts[0];
                setCurrentAccount(account);
            }
        }).finally(() => {
            setLoginLoad(false);
        });
    };

    useEffect(() => {
        checkAccount();
    }, []);

    const renderContent = () => {
        return currentAccount
            ? <div>Hello {currentAccount}</div>
            : <Button loading={loginLoad} onClick={handleLogin}>connect to the wallet</Button>;
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
