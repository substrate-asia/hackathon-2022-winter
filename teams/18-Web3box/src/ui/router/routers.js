import Index from "../pages/Wallet/Wallet";
import CreatWallte from '../pages/CreatWallte/CreatWallte';
import LoginWallet from '../pages/LoginWallet/LoginWallet';
import WalletHome from '../pages/WalletHome/WalletHome';
import AssetsTabs from '../pages/AssetsTabs/AssetsTabs';
import SendRecord from '../pages/SendRecord/SendRecord';
import RiskRecord from '../pages/RiskRecord/RiskRecord';
import RiskDetail from '../pages/RiskDetail/RiskDetail';

//The routing configuration
const routes =  [
    {
        path:'/', 
        component: Index,
        exact: true,
        },

    {
    path:'/Wallet',
    component: Index,
    exact: true,    

    },
    {
        lable:'CreatWallte',
        path: "/CreatWallet",
        component: CreatWallte,
        exact: true,
        key:'CreatWallte',
    },
    {
        path: "/LoginWallet",
        component: LoginWallet,
        exact: true,
        key:'LoginWallet',
    },
    {
        path: "/WalletHome",
        component: WalletHome,
        exact: true,
        key:'WalletHome',
    },
    {
        path: "/AssetsTabs",
        component: AssetsTabs,
        exact: true,
        key:'AssetsTabs',
    },
    {
        path: "/SendRecord",
        component: SendRecord,
        exact: true,
        key:'SendRecord',
    }, 
    {
        path: "/RiskRecord",
        component: RiskRecord,
        exact: true,
        key:'RiskRecord',
    }, 
    {
        path: "/RiskDetail",
        component: RiskDetail,
        exact: true,
        key:'RiskDetail',
    }, 
]
export default routes;