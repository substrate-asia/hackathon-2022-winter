import React from "react";
import './supperChain.scss';
import { connect ,useDispatch, useSelector} from 'react-redux';
import { setAccount,setSeed } from '../../store/action';
import pol_img from '../../images/pol.png';
import kus_img from '../../images/kus.png';
import aca_img from '../../images/acalc.png';
import astar_img from '../../images/astar.png';
import beam_img from '../../images/beam.png';

function SuperChain() {
    return (
        <div className="chain" >
            <div className='login_wallet'>
                <h6>Supported Chains</h6>
                <ul>
                    <li>
                       <img src={pol_img}></img> 
                    </li>
                    <li>
                       <img src={kus_img}></img> 
                    </li>
                    <li>
                       <img src={aca_img}></img> 
                    </li>
                    <li>
                       <img src={astar_img}></img> 
                    </li>
                    <li>
                       <img src={beam_img}></img> 
                    </li>
                </ul>
            </div>
            </div>
      
    )
}
const mapDispatchToProps= () =>{ 
    return {
        setAccount, setSeed 
    }
}
export default connect(mapDispatchToProps)(SuperChain)
