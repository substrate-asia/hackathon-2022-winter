// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./LibProject.sol";
import "./TransService.sol";
import "./contracts/access/Ownable.sol";
import "./TransferService.sol";
error OperationException(string);
error ErrorValue(string,uint256);
error Permissions(string);
contract TransImpl is Ownable,TransferService,TransService{
    event postProjectEv(address,uint256,LibProject.ProParm);
    event acceptTaskEv(uint256,uint256[],address,bool);
    event acceptTaskEv(uint256,uint256,address,bool);

    modifier isCanAcceptTrans(uint256 _index) {
        if(!TransService.getTaskStateTrans(_index)){
            revert OperationException("Can't receive task");
        }
        _;
    }
    modifier isCanAcceptVf(uint256 _index) {
        if(!TransService.getTaskStateVf(_index)){
            revert OperationException("Can't receive task");
        }
        _;
    }
    modifier onlyBuyer(uint256 _index) {
        require(TransService.getProjectOne(_index).buyer == msg.sender,"Only buyer");
        _;
    }
    modifier isExist(uint256 _index){
        if(_index>TransService.getCount()){
            revert ParameterException("Wrong index value!");
        }
        _;
    }
    modifier hasFine(address _address) {
        uint256 _money =TransService.getPay(_address);
        if(_money>0) {
            revert Permissions("unpaid penalty!");
        }
        _;
    }
    // TransService service;
    // constructor(address _serAddress) {
    //    service = TransService(_serAddress);
    // }
    //质押30%，校验通过，30%给翻译者，需求方验收通过，支付其余的赏金。
    //文件状态修改：翻译等待，校验等待
    function postTask(LibProject.ProParm memory _t) public payable hasFine(msg.sender)  returns(uint256 _index) {
       _index =  _postTask(_t);
       //质押30%赏金
      uint256 _bounty = CalculateUtils.getPercentage(_t.bounty*1e18,30);
      if(msg.value <_bounty ) {
          revert ErrorValue("Incorrect value",msg.value);
        }
        transderToContract();
    }
  
    function updateTask(uint256 _index,LibProject.ProParm memory _t) public payable hasFine(msg.sender) isExist(_index){
        _updateTask(_index, _t);
        uint256 _bounty = CalculateUtils.getPercentage(_t.bounty,30);
        if(msg.value != _bounty *1e18) {
          revert ErrorValue("Incorrect value",msg.value);
        }
        transderToContract();
       
    }
    function newAmphiAddess(address _newAddress) public onlyOwner {
        amphi_address = _newAddress;
    }
    function endTransAccept(uint256 _index) public isExist(_index) {
        _endTransAccept( _index);
    }
     function endTransVf(uint256 _index) public isExist(_index) {
        _endTransVf( _index);
    }
    function acceptForTranslator(uint256 _index,uint256[] memory _fileIndex) public isExist(_index) isCanAcceptTrans(_index) hasFine(msg.sender){
        TransService.acceptTrans(_index,_fileIndex,msg.sender);
        emit acceptTaskEv(_index,_fileIndex,msg.sender,true);
    }
    function acceptForVerifer(uint256 _index,uint256[] memory _fileIndex) public isExist(_index) isCanAcceptVf(_index) hasFine(msg.sender){
        TransService.acceptVf(_index,_fileIndex,msg.sender);
         emit acceptTaskEv(_index,_fileIndex,msg.sender,false);
    }
    function validate(uint256 _index,address _traner,uint256 _fileIndex, bool _isPass,string memory _file) public isExist(_index){
      LibProject.FileState _fileState;
        _fileState=TransService.getFileState(_index,_fileIndex);
        if(_fileState>LibProject.FileState.WaitVfModify){
          revert OperationException("unable to submit");
        }
      uint256 _bounty =  _validate(_index,_traner,_fileIndex,_isPass,_file);
       //发赏金
      if(_bounty>0) {
        //   service.deductBounty(_index,_traner,_fileIndex,_bounty,true);
          toTaskerBounty(_traner,_bounty);
      }
    }
    function sumbitTaskTrans(uint256 _index, uint256 _fileIndex,string memory _file) public isExist(_index){
      LibProject.FileState _fileState;
      _fileState=TransService.getFileState(_index,_fileIndex);
      if(_fileState>LibProject.FileState.BuyerReview){
          revert OperationException("unable to submit");
      }
        _sumbitTaskTrans(_index,_fileIndex,_file);
    }
    function overTimeTrans(uint256 _index, address _tasker)public isExist(_index) returns(uint256) {
         uint256 _money =  _overTimeTrans(_index,_tasker);
         TransService.addPay(_tasker, _money);
         return _money;
    }
     function overTimeVf(uint256 _index, address _tasker)public isExist(_index) returns(uint256) {
        uint256 _money = _overTimeVf(_index,_tasker);
        TransService.addPay(_tasker, _money);
        return _money;
     }
     //支付罚金
     function payFine(address _to) public  payable{
         if(msg.value > TransService.getPay(_to)*1e18){
             revert ErrorValue("value is too high",msg.value);
         }
         TransService.deductPay(_to,msg.value);
         pay(_to,msg.value);
     }
     function receiveTask(uint256 _index,address _taskerIndex,uint256 _fileIndex, bool _isPass,address _transAddress) public payable isExist(_index) {
         uint256 _bounty;
         if(TransService.isCustomizeState(_index)){
                 _bounty = TransService.getTaskBounty(_index,_fileIndex);
         }else{
                 _bounty = TransService.getTaskBounty(_index);
          }
           _receiveTask(_index,_taskerIndex,_fileIndex,_isPass);
         //若验收通过，将合约剩余的70%的钱存入合约中
         if(_isPass){
             uint256 _payMoney = CalculateUtils.getPercentage(_bounty*1e18,70);
             if(msg.value < _payMoney) {
                 revert ErrorValue("error : Incorrect value",msg.value);
                 }
            transderToContract();
            uint256 _vfBounty = CalculateUtils.getTaskVf(_bounty*1e18);
             uint256 _transBounty = CalculateUtils.getTaskTransEnd(_bounty*1e18);
             toTaskerBounty(_taskerIndex,_vfBounty);
             toTaskerBounty(_transAddress,_transBounty);
        }    
     }
     function closeTask(uint256 _index) public {
         TransService._closeTask(_index);
     }
     function closeFileState(uint256 _index,uint256 _fileIndex) public {
         TransService._closeFileState(_index,_fileIndex);
     }
    //发布任务
     function _postTask(LibProject.ProParm memory _t) internal returns(uint256) {
     uint256 _index = TransService.addProject( _t);
     emit postProjectEv(msg.sender,_index,_t);
       return _index;
    }
    function getTaskInfo(uint256 _index) public view isExist(_index) returns(LibProject.ReturnTask memory) {
        return TransService.getProjectOne(_index);
    }
    //支付赏金-发布
    //function postPay(uint256 _index) 
    //修改任务
    function _updateTask(uint256 _index,LibProject.ProParm memory _t) internal {
         TransService.updateProject(_index,_t);
       emit postProjectEv(msg.sender,_index,_t);
    }  //到截至日期后，调用该方法，若到截至日期已经完成接单，则返回true,//若无人接收任务，则修改任务状态为无人接收状态，关闭翻译接收
    //若有部分人接收，进入任务强分配
    function _endTransAccept( uint256 _index) internal returns(bool){
        uint256 _transNumber = TransService.getTransNumber(_index);
        LibProject.TaskInfo[] memory _tasks = TransService.getTasks(_index);
      if(TransService.isFull(_index,true)){
          return true;
          //若到翻译截至日期，仍无人接单，则关闭翻译接单状态
      }else if(_transNumber == 0) {
          //service.updateState(_index,LibProject.ProjectState.NoOnePick);
          TransService.closeTransAccept(_index);
          // emit uploadAcceptStateEv(msg.sender, _index,"ts",false);
          return false;
      }else {
          uint256 _count = _tasks.length;
          uint256 _acceptedNum = _transNumber;
          uint256 avgNum = _count/_acceptedNum;
          address[] memory _list = TransService.getTranslatorsList(_index);
          for(uint256 i =0;i<_tasks.length;i++) {
              //任务为待接收状态
              if(_tasks[i].state == LibProject.FileState.Waiting){
                  //为未分配任务分配任务者
                  for(uint256 q=0;q<_transNumber;q++){
                      //超出分配线，不予分配
                   if(TransService.getAcceptTransNumber(_index,_list[q])>avgNum){
                      continue;
                  }
                  //将当前任务分配给翻译者
                 TransService.accept(_index,i,_list[q],true);
                emit acceptTaskEv(_index,i,_list[q],true);
                  break;
              }
            }      
          }
          TransService.closeTransAccept(_index);
          if(isFull(_index,false)) {
              TransService.updateState(_index,LibProject.ProjectState.Processing);
          }else{
               TransService.updateState(_index,LibProject.ProjectState.WaitingForVf);
          }
          return false;
      }
    }
    //
   function _endTransVf( uint256 _index) internal onlyOwner returns(bool) {
       uint256 vfNumber = TransService.getVfNumber(_index);
       uint256 _transNumber = TransService.getTransNumber(_index); 
       LibProject.TaskInfo[] memory _tasks = TransService.getTasks(_index);
      if(TransService.isFull(_index,false)){
          return true;
      }else if(vfNumber==0 && _transNumber!=0) {
          TransService.closeVfAccept(_index);
          return false;
      }
      else if(vfNumber == 0 && _transNumber ==0) {
           //若无人接收任务，则修改任务状态为无人接收状态，关闭翻译接收
          TransService.onNoOnePink(_index);
          address _buyer =TransService.getBuyer(_index);
          uint256 _bounty = CalculateUtils.getPercentage(TransService.getTaskBounty(_index),30);
          //退还金额给需求方
          toTaskerBounty(_buyer,_bounty);
          return false;
      }else {
          //若有部分人接收
          uint256 _count = _tasks.length;
          uint256 _acceptedNum = vfNumber;
          uint256 avgNum = _count/_acceptedNum;
          address[] memory _list = TransService.getVfList(_index);
          for(uint256 i =0;i<_tasks.length;i++) {
              //任务为待接收状态
              if(_tasks[i].state == LibProject.FileState.Waiting){
                  //为未分配任务分配任务者
                  for(uint256 q=0;q<vfNumber;q++){
                      //超出分配线，不予分配
                  if(TransService.getAcceptVfNumber(_index,_list[q])>avgNum){
                      continue;
                  }
                  //将当前任务分配给翻译者
                   TransService.accept(_index,i,_list[q],false);
                   emit acceptTaskEv(_index,i,_list[q],false);
                  break;
              }
            }      
          }
          TransService.closeVfAccept(_index);
          if(isFull(_index,true)) {
               TransService.updateState(_index,LibProject.ProjectState.Processing);
          } else {
              TransService.updateState(_index,LibProject.ProjectState.WaitingForTrans);
          }
       }
          return false;
      }
    //提交任务-翻译者
    function _sumbitTaskTrans(uint256 _index, uint256 _fileIndex,string memory _file) internal {
       TransService.sumbitTransTask(_index,msg.sender,_fileIndex,_file);
    }

    //超时未提交-翻译者
    function _overTimeTrans(uint256 _index, address _taskerIndex)internal returns(uint256) {
        //查询超时任务数
        uint256[] memory _unCompleted;
        uint256 _money;
        (_unCompleted,_money) = TransService.overTimeTasker(_index,_taskerIndex,true);
        if(_unCompleted.length ==0) {
            return 0;
        }
        //修改任务状态
        TransService.updateTaskerState(_index,_taskerIndex,_unCompleted,LibProject.TaskerState.Overtime,true);
        uint256 _allBounty;
        if(TransService.isCustomizeState(_index)){
            for(uint256 i=0;i<_unCompleted.length;i++) {
                _allBounty+=TransService.getProjectOne(_index).tasks[_unCompleted[i]].bounty;
            }
        }else{
            _allBounty =TransService.getProjectOne(_index).bounty;
        }
        //计算罚金 
    //   uint256 _rate=  CalculateUtils.punishRatio(service.getTranslators(_index,_taskerIndex).bounty);
       uint256 _rate=  CalculateUtils.punishRatio(CalculateUtils.getTaskTrans(_allBounty));  
      uint256 _punish = CalculateUtils.getPunish(_money,_rate);
        //返回罚金
        return _punish;
    }
      //超时未提交-校验者
    function _overTimeVf(uint256 _index, address _taskerIndex)internal returns(uint256) {
        //查询超时任务数
        uint256[] memory _unCompleted;
        uint256 _money;
        (_unCompleted,_money) = TransService.overTimeTasker(_index,_taskerIndex,false);
        if(_unCompleted.length ==0) {
            return 0;
        }
        //修改任务状态
         TransService.updateTaskerState(_index,_taskerIndex,_unCompleted,LibProject.TaskerState.Overtime,false);   
        //计算罚金
        uint256 _allBounty;
        if(TransService.isCustomizeState(_index)){
            for(uint256 i=0;i<_unCompleted.length;i++) {
                _allBounty+=TransService.getProjectOne(_index).tasks[_unCompleted[i]].bounty;
            }
        }else{
            _allBounty =TransService.getProjectOne(_index).bounty;
        }
        //1.根据赏金获得处罚比率
        uint256 _rate=  CalculateUtils.punishRatio(CalculateUtils.getTaskVf(_allBounty));
        uint256 _punish = CalculateUtils.getPunish(_money,_rate);
        return _punish;
    }
    //校验者验收
     function _validate(uint256 _index,address _transIndex,uint256 _fileIndex, bool _isPass,string memory _file) internal returns(uint256 _payBounty) {
         //若校验通过，将任务者的状态修改为已完成
         if(_isPass) {
             //若用户为自定义支付，则完成后支付任务者赏金
             TransService.sumbitVfTask(_index,_transIndex,msg.sender,_fileIndex,_file);
             bool _Customize=TransService.isCustomizeState(_index);
             if(_Customize){
                 _payBounty = TransService.getTaskBounty(_index,_fileIndex);
             }else{
                 _payBounty = TransService.getTaskBounty(_index);
             }
             //校验者验收，支付翻译者30%赏金
            _payBounty = CalculateUtils.getPercentage(_payBounty*1e18,30);
         }else{
             //任务不通过，将任务者的状态修改为被打回状态 
             TransService.returnTasker(_index,_transIndex,_fileIndex,true);   
             _payBounty = 0; 
         }
         
     }
    //发布者验收
    function _receiveTask(uint256 _index,address _taskerIndex,uint256 _fileIndex, bool _isPass) internal{
         //若校验通过，将任务者的状态修改为已完成
         if(_isPass) {
             TransService.receivePass(_index,_taskerIndex,_fileIndex);
         }else{
             //任务不通过，将任务者的状态修改为被打回状态
             TransService.returnTasker(_index,_taskerIndex,_fileIndex,false);   
         }
     }
     function withdraw(uint256 _money) public onlyOwner {
         _withdraw(_money);
     }
     function withdrawAll() public onlyOwner {
         _withdrawAll();
     }
     
}