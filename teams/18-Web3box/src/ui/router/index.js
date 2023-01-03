//import touter
import { HashRouter as Router, Route, Switch,Redirect } from 'react-router-dom';
import Index from "../pages/Wallet/Wallet";
import routers from "./routers";
// console.log(Switch)
//routers
function Routes() {
    return (
        <div>
            <Router>
                <Switch>
                    {
                        routers.map((item,index)=>{
                            return (
                                <Route key={index} path={item.path} exact={item.exact} component={item.component}></Route>
                            )
                        })
                    }
                    {/* <Route path='/cate' component={Cate}></Route> */}
                    
                </Switch>
            </Router>
        </div>
    )
}
export default Routes;