// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./LibProject.sol";
import "./utils/calculateUtils.sol";
error FileException(string,LibProject.FileState);
contract TransService {
    //任务索引值，文件索引值，文件状态，操作者
    event changeFileStateEv(uint256,uint256,LibProject.FileState,address);
    //任务索引值，文件状态，操作者
    event changeProjectStateEv(uint256,LibProject.ProjectState,address);
    //任务索引值、任务者地址、文件索引值，任务者状态，是否为翻译者,操作者
    event changeTaskerStateEv(uint256,address,uint256,LibProject.TaskerState,bool,address);
    //任务索引值，是否关闭，操作者
    event changeTransActive(uint256,bool,address);
    event changeVerActive(uint256,bool,address);
    mapping (uint256 => LibProject.TranslationPro) private taskList;
    mapping (address => uint256) private payList;
    uint256 private count;
    function addPay(address _tasker,uint256 _money) internal {
        payList[_tasker] += _money;
    }
    function deductPay(address _tasker, uint256 _money) internal {
        payList[_tasker]-= _money;
    }
    function getPay(address _tasker) public view returns(uint256) {
        return payList[_tasker];
    }
    //增加项目
    function addProject(LibProject.ProParm memory _t)  internal returns(uint256) {
       count++;
       //  taskIndex[_buyer].push(count);
        LibProject.TranslationPro storage _pro= taskList[count];
        _pro.buyer = msg.sender;
        _pro.releaseTime = _t.releaseTime;
        _pro.introduce = _t.introduce;
        _pro.need=_t.need;
        _pro.deadline=_t.deadline;
        _pro.sourceLanguage=_t.sourceLanguage;
        _pro.goalLanguage=_t.goalLanguage;
        _pro.preferList = _t.preferList;
        _pro.translationType=_t.translationType;
        _pro.workLoad = _t.workLoad;
        _pro.bounty=_t.bounty;
        _pro.isNonDisclosure = _t.isNonDisclosure;
        _pro.isCustomize = _t.isCustomize;
        if(_t.isCustomize) {
            _pro.maxT = _t.tasks.length; 
             _pro.maxV = _t.tasks.length;
            
         }else{
            _pro.maxT =1;
            _pro.maxV =1;
         }
        // _pro.state = LibProject.ProjectState.Published;
        _pro.isTransActive = true;
        _pro.isVerActive = true;
        for(uint256 i=0;i< _t.tasks.length;i++) {
            _t.tasks[i].state= LibProject.FileState.Waiting;
            _pro.tasks.push(_t.tasks[i]);
        }
        return count;
    }
    function updateProject(uint256 _index,LibProject.ProParm memory _t)  internal{
        LibProject.TranslationPro storage _pro= taskList[_index];
        _pro.releaseTime = _t.releaseTime;
        _pro.introduce = _t.introduce;
        _pro.need=_t.need;
        _pro.deadline=_t.deadline;
        _pro.sourceLanguage=_t.sourceLanguage;
        _pro.goalLanguage=_t.goalLanguage;
        _pro.preferList = _t.preferList;
        _pro.translationType=_t.translationType;
        _pro.workLoad = _t.workLoad;
        _pro.bounty=_t.bounty;
        _pro.isNonDisclosure = _t.isNonDisclosure;
        _pro.isCustomize = _t.isCustomize;
        // _pro.state = LibProject.ProjectState.Published;
       if(_t.isCustomize) {
            _pro.maxT = _t.tasks.length; 
             _pro.maxT = _t.tasks.length;
            
         }else{
            _pro.maxT =1;
            _pro.maxT =1;
         }
        _pro.isTransActive = true;
        // _pro.state = LibProject.ProjectState.Published;
        for(uint256 i=0;i< _t.tasks.length;i++) {
            _pro.tasks.push(_t.tasks[i]);
        }
    }
    //修改项目状态
    function updateState(uint256 _index, LibProject.ProjectState _state) internal {
        taskList[_index].state = _state;
        emit changeProjectStateEv(_index,_state,msg.sender);
    }
    //批量修改任务状态
    function updateTaskerState(uint256 _index,address  _taskerAddress,uint256[] memory _fileIndex,LibProject.TaskerState _state, bool _isTrans) internal {
        if(_isTrans){
            //  _tasker=taskList[_index].transInfo[_taskerAddress];
        for(uint256 i=0;i<_fileIndex.length;i++) {
            taskList[_index].transInfo[_taskerAddress].info[_fileIndex[i]].state = _state;
            emit changeTaskerStateEv(_index,_taskerAddress,_fileIndex[i],_state,true,msg.sender);
        }
        }else{
        for(uint256 i=0;i<_fileIndex.length;i++) {
            taskList[_index].vfInfo[_taskerAddress].info[_fileIndex[i]].state = _state;
            emit changeTaskerStateEv(_index,_taskerAddress,_fileIndex[i],_state,false,msg.sender);
        }
        }
    }
    function returnTasker(uint256 _index,address _taskerIndex,uint256 _fileIndex,bool _isTrans)internal {
        //修改任务者状态&修改文件状态
        if(_isTrans) {
            taskList[_index].transInfo[_taskerIndex].info[_fileIndex].state=LibProject.TaskerState.Return;
             emit changeTaskerStateEv(_index,_taskerIndex,_fileIndex,LibProject.TaskerState.Return,true,msg.sender);
            taskList[_index].tasks[_fileIndex].state = LibProject.FileState.WaitTransModify;
            emit changeFileStateEv(_index,_fileIndex,LibProject.FileState.WaitTransModify,msg.sender);
        }else {
            taskList[_index].vfInfo[_taskerIndex].info[_fileIndex].state=LibProject.TaskerState.Return;
            emit changeTaskerStateEv(_index,_taskerIndex,_fileIndex,LibProject.TaskerState.Return,false,msg.sender);
            taskList[_index].tasks[_fileIndex].state = LibProject.FileState.WaitVfModify;
            emit changeFileStateEv(_index,_fileIndex,LibProject.FileState.WaitVfModify,msg.sender);
        }
    }
    function onNoOnePink(uint256 _index) internal {
        taskList[_index].state = LibProject.ProjectState.NoOnePick;
        emit changeProjectStateEv(_index,LibProject.ProjectState.NoOnePick,msg.sender);
        taskList[_index].isVerActive = false;
        emit changeTransActive(_index,false,msg.sender);
    }
    function closeTransAccept(uint256 _index) internal {
        taskList[_index].isTransActive = false;
        emit changeTransActive(_index,false,msg.sender);
    }
    function _closeFileState(uint256 _index,uint256 _fileIndex) internal {
        taskList[_index].tasks[_fileIndex].state = LibProject.FileState.Closed;
        emit changeFileStateEv(_index,_fileIndex,LibProject.FileState.Closed,msg.sender);
    }
    function getTaskBounty(uint256 _index,uint256 _fileIndex) public view returns(uint256) {
        return taskList[_index].tasks[_fileIndex].bounty;
    }
    function getTaskBounty(uint256 _index) public view returns(uint256) {
        return taskList[_index].bounty;
    }
    function closeVfAccept( uint256 _index) internal {
        taskList[_index].isVerActive = false;
        emit changeVerActive(_index,false,msg.sender);
    }
    //翻译者提交任务
    function sumbitTransTask(uint256 _index,address _taskerIndex, uint256 _fileIndex,string memory _file) internal {
         LibProject.TranslationPro storage _pro= taskList[_index];
        _pro.tasks[_fileIndex].state = LibProject.FileState.Validating;
        emit changeFileStateEv(_index,_fileIndex,LibProject.FileState.Validating,msg.sender);
        _pro.tasks[_fileIndex].lastUpload = block.timestamp;
        _pro.transInfo[_taskerIndex].info[_fileIndex].file = _file;
        _pro.transInfo[_taskerIndex].info[_fileIndex].state= LibProject.TaskerState.Submitted;
        emit changeTaskerStateEv(_index,_taskerIndex,_fileIndex,LibProject.TaskerState.Submitted,true,msg.sender);
    }
    //校验者验收&提交任务
    function sumbitVfTask(uint256 _index,address _transIndex,address _vfIndex, uint256 _fileIndex,string memory _file) internal {
        
         LibProject.TranslationPro storage _pro= taskList[_index];
         _pro.transInfo[_transIndex].info[_fileIndex].state =LibProject.TaskerState.Completed;
         emit changeTaskerStateEv(_index,_transIndex,_fileIndex,LibProject.TaskerState.Completed,true,msg.sender);
         //校验者提交任务
         _pro.tasks[_fileIndex].state = LibProject.FileState.BuyerReview;
         emit changeFileStateEv(_index,_fileIndex,LibProject.FileState.BuyerReview,msg.sender);
        _pro.tasks[_fileIndex].lastUpload = block.timestamp;
        _pro.vfInfo[_vfIndex].info[_fileIndex].file = _file;
        _pro.vfInfo[_vfIndex].info[_fileIndex].state = LibProject.TaskerState.Submitted;
         emit changeTaskerStateEv(_index,_vfIndex,_fileIndex,LibProject.TaskerState.Submitted,false,msg.sender);
    }
    //翻译者接收任务
    function acceptTrans(uint256 _index,uint256[] memory _fileIndex, address _taskerIndex) internal{
       //若长度为0，说明该任务者是首次接收该任务,将翻译者存入到翻译者名单中
       LibProject.Tasker storage _taskerInfo = taskList[_index].transInfo[_taskerIndex];
       if(_taskerInfo.taskIndex.length==0) {
           taskList[_index].translators.push(_taskerIndex);
        }
        LibProject.FileState _state;
        for(uint256 q=0;q<_fileIndex.length;q++) {
            _state =taskList[_index].tasks[_fileIndex[q]].state;
            //根据目前文件状态，修改文件状态
            if(_state== LibProject.FileState.Waiting) {
                taskList[_index].tasks[_fileIndex[q]].state = LibProject.FileState.WaitingForVf;
                emit changeFileStateEv(_index,_fileIndex[q],LibProject.FileState.WaitingForVf,msg.sender);
            }else if(_state == LibProject.FileState.WaitingForTrans) {
                taskList[_index].tasks[_fileIndex[q]].state= LibProject.FileState.Translating;
                emit changeFileStateEv(_index,_fileIndex[q],LibProject.FileState.Translating,msg.sender);
            }else{
                revert FileException("Error file state",_state);
            }
            _taskerInfo.taskIndex.push(_fileIndex[q]);
           
        }
        //    //文件状态修改为翻译中
       taskList[_index].numberT++;
       if(isFull(_index,true)) {
          taskList[_index].isTransActive = false;
          emit changeTransActive(_index,false,msg.sender);
          if(isFull(_index,false)) {
             taskList[_index].state = LibProject.ProjectState.Processing;
             emit changeProjectStateEv(_index,LibProject.ProjectState.Processing,msg.sender);
          }else{
              taskList[_index].state = LibProject.ProjectState.WaitingForVf;
           emit changeProjectStateEv(_index,LibProject.ProjectState.WaitingForVf,msg.sender);
          }
           
       }
    }
     //校验者接收任务
    function acceptVf(uint256 _index,uint256[] memory _fileIndex, address _taskerIndex) internal {
       //若长度为0，说明该任务者是首次接收该任务,将翻译者存入到翻译者名单中
       LibProject.Tasker storage _taskerInfo = taskList[_index].vfInfo[_taskerIndex];
       if(_taskerInfo.taskIndex.length==0) {
           taskList[_index].verifiers.push(_taskerIndex);
        }
        LibProject.FileState _state;
        for(uint256 q=0;q<_fileIndex.length;q++) {
            _state =taskList[_index].tasks[_fileIndex[q]].state;
            //根据目前文件状态，修改文件状态
            if(_state == LibProject.FileState.Waiting) {
                taskList[_index].tasks[_fileIndex[q]].state = LibProject.FileState.WaitingForTrans;
                emit changeFileStateEv(_index,_fileIndex[q],LibProject.FileState.WaitingForTrans,msg.sender);
            }else if(_state == LibProject.FileState.WaitingForVf) {
                taskList[_index].tasks[_fileIndex[q]].state= LibProject.FileState.Translating;
                emit changeFileStateEv(_index,_fileIndex[q],LibProject.FileState.Translating,msg.sender);
            }else{
                revert FileException("Error file state",_state);
            }
            _taskerInfo.taskIndex.push(_fileIndex[q]);
           
        }
       //文件状态修改为翻译中
       taskList[_index].numberV++;
       if(isFull(_index,false)) {
          taskList[_index].isVerActive = false;
          emit changeVerActive(_index,false,msg.sender);
          if(isFull(_index,true)) {
             taskList[_index].state = LibProject.ProjectState.Processing;
             emit changeProjectStateEv(_index,LibProject.ProjectState.Processing,msg.sender);
          }else{
              taskList[_index].state = LibProject.ProjectState.WaitingForTrans;
           emit changeProjectStateEv(_index,LibProject.ProjectState.WaitingForTrans,msg.sender);
          }
       }
    }
    function accept(uint256 _index,uint256  _fileIndex, address _taskerIndex, bool _isTrans) internal  {
         LibProject.FileIndexInfo storage _taskerInfo;
        if(_isTrans) {
            _taskerInfo = taskList[_index].transInfo[_taskerIndex].info[_fileIndex];
             taskList[_index].numberT++;
        }else{
            _taskerInfo = taskList[_index].vfInfo[_taskerIndex].info[_fileIndex];
             taskList[_index].numberV++;
        }
               taskList[_index].transInfo[_taskerIndex].taskIndex.push(_fileIndex);
    }
    //判断任务是否已满
    function isFull(uint256 _index, bool _isTrans) public view returns(bool) {
       if(_isTrans){
          return taskList[_index].maxT <= taskList[_index].numberT;
       }else{
          return taskList[_index].maxV <= taskList[_index].numberV;
       }
    }
    //关闭项目
    function _closeTask(uint256 _index) internal {
        taskList[_index].state = LibProject.ProjectState.Closed;
        emit changeProjectStateEv(_index,LibProject.ProjectState.Closed,msg.sender);
    }
    function completedTask(uint256 _index) internal {
        taskList[_index].state = LibProject.ProjectState.Completed;
         emit changeProjectStateEv(_index,LibProject.ProjectState.Completed,msg.sender);
    }
    function getProjectOne(uint256 _index) internal view returns(LibProject.ReturnTask memory) {
        LibProject.ReturnTask memory _returnTask;
        _returnTask.buyer =taskList[_index].buyer;
        _returnTask.releaseTime = taskList[_index].releaseTime;
        _returnTask.introduce = taskList[_index].introduce;
        _returnTask.need = taskList[_index].need;
        _returnTask.deadline = taskList[_index].deadline;
        _returnTask.sourceLanguage = taskList[_index].sourceLanguage;
        _returnTask.goalLanguage = taskList[_index].goalLanguage;
        _returnTask.preferList = taskList[_index].preferList;
        _returnTask.translationType = taskList[_index].translationType;
        _returnTask.workLoad = taskList[_index].workLoad;
        _returnTask.isNonDisclosure = taskList[_index].isNonDisclosure;
        _returnTask.isCustomize = taskList[_index].isCustomize;
        _returnTask.bounty = taskList[_index].bounty;
        _returnTask.maxT = taskList[_index].maxT;
        _returnTask.maxV = taskList[_index].maxV;
        _returnTask.numberT = taskList[_index].numberT;
        _returnTask.numberV = taskList[_index].numberV;
        _returnTask.isTransActive = taskList[_index].isTransActive;
        _returnTask.isVerActive = taskList[_index].isVerActive;
        _returnTask.state = taskList[_index].state;
        _returnTask.tasks = taskList[_index].tasks;
        uint256 transLen =taskList[_index].translators.length;
        uint256 vfLen =taskList[_index].verifiers.length;
        LibProject.ReturnTasker[] memory _transInfo = new LibProject.ReturnTasker[](transLen);
        LibProject.ReturnTasker[] memory _vfInfo = new LibProject.ReturnTasker[](vfLen);
        for(uint256 i=0;i<transLen;i++) {
            _transInfo[i] = getTransTaskInfo(_index,taskList[_index].translators[i]);
        }
        for(uint256 i=0;i<vfLen;i++) {
            _vfInfo[i] = getVfTaskInfo(_index,taskList[_index].verifiers[i]);
        }
        _returnTask.transInfo = _transInfo;
        _returnTask.vfInfo = _vfInfo;
        
       return _returnTask;
    }
    function getTasks(uint256 _index) public view returns(LibProject.TaskInfo[] memory) {
        return taskList[_index].tasks;
    }
    function getCount() public view returns(uint256) {
        return count;
    }
    //任务翻译者总数量
   function getTransNumber(uint256 _index) public view returns(uint256) {
       return taskList[_index].translators.length;
   }
   function getVfNumber(uint256 _index) public view returns(uint256) {
       return taskList[_index].verifiers.length;
   }
   //获得指定任务翻译者接单数
   function getAcceptTransNumber(uint256 _index,address _taskerIndex) public view returns(uint256) {
       return taskList[_index].transInfo[_taskerIndex].taskIndex.length;
   }
   function getAcceptVfNumber(uint256 _index, address _taskerIndex) public view returns(uint256) {
       return taskList[_index].vfInfo[_taskerIndex].taskIndex.length;
   }
   //获得翻译者名单
   function getTranslatorsList(uint256 _index) public view returns(address[] memory) {
       return taskList[_index].translators;
   }
   //获得校验者名单
   function getVfList(uint256 _index) public view returns(address[] memory) {
       return taskList[_index].verifiers;
   }
    function isCustomizeState(uint256 _index) public view returns(bool){
        return taskList[_index].isCustomize;
    }
    //查询任务者超时未完成任务数
    function overTimeTasker(uint256 _index, address _taskerIndex, bool _isTrans) public view returns(uint256[] memory,uint256) {
        uint256[] memory _filesIndex ;
        uint256[] memory _list;
        uint256 money;
        uint256 q;
        if(_isTrans) {
          _filesIndex  = taskList[_index].transInfo[_taskerIndex].taskIndex; 
        }else { 
            _filesIndex  = taskList[_index].vfInfo[_taskerIndex].taskIndex;
        }
        LibProject.FileIndexInfo memory  _info;
        for(uint256 i=0;i<_filesIndex.length;i++) {
           _info = taskList[_index].transInfo[_taskerIndex].info[_filesIndex[i]];
            if(_info.state == LibProject.TaskerState.Processing){
                _list[q] = _filesIndex[i];
                q++;
                money+= taskList[_index].tasks[_filesIndex[i]].bounty;
            }
        }   
        return (_list,money);
    }
    function receivePass(uint256 _index, address _taskerIndex,uint256 _fileIndex) internal {
        taskList[_index].vfInfo[_taskerIndex].info[_fileIndex].state=LibProject.TaskerState.Completed;
        emit changeTaskerStateEv(_index,_taskerIndex,_fileIndex,LibProject.TaskerState.Completed,false,msg.sender);
        taskList[_index].tasks[_fileIndex].state= LibProject.FileState.Accepted;
        emit changeFileStateEv(_index,_fileIndex, LibProject.FileState.Accepted,msg.sender);
    }
    function getBuyer(uint256 _index) public view returns(address) {
        return taskList[_index].buyer;
    }
    function getTaskState(uint256 _index) public view returns(LibProject.ProjectState) {
        return taskList[_index].state;
    }
    function getFileState(uint256 _index,uint256 _fileIndex) public view returns(LibProject.FileState){
        return taskList[_index].tasks[_fileIndex].state;
    }
    function getTaskStateVf(uint256 _index) public view returns(bool) {
        return taskList[_index].isVerActive;
    }
    function getTaskStateTrans(uint256 _index) public view returns(bool) {
        return taskList[_index].isTransActive;
    }
    //获得翻译者任务详细信息
    function getTransTaskInfo(uint256 _index,address _address) public view returns(LibProject.ReturnTasker memory) {
        LibProject.ReturnTasker memory _taskerInfo;
        _taskerInfo.taskerAddress = _address;
        _taskerInfo.taskIndex = taskList[_index].transInfo[_address].taskIndex;
         LibProject.FileIndexInfo[] memory _fileIndexInfo = new LibProject.FileIndexInfo[](_taskerInfo.taskIndex.length);
        //  LibProject.FileIndexInfo memory _info;
        for(uint256 q=0;q<_taskerInfo.taskIndex.length;q++) {
            _fileIndexInfo[q].state = taskList[_index].transInfo[_address].info[_taskerInfo.taskIndex[q]].state;
            _fileIndexInfo[q].file = taskList[_index].transInfo[_address].info[_taskerInfo.taskIndex[q]].file;
        }
        _taskerInfo.taskerinfo = _fileIndexInfo;
        return _taskerInfo;
    }
    //获得校验者任务详细信息
    function getVfTaskInfo(uint256 _index,address _address)  public view returns(LibProject.ReturnTasker memory) {
        LibProject.ReturnTasker memory _taskerInfo;
        _taskerInfo.taskerAddress = _address;
        _taskerInfo.taskIndex = taskList[_index].vfInfo[_address].taskIndex;
         LibProject.FileIndexInfo[] memory _fileIndexInfo = new LibProject.FileIndexInfo[](_taskerInfo.taskIndex.length);
        for(uint256 q=0;q<_taskerInfo.taskIndex.length;q++) {
             _fileIndexInfo[q].state = taskList[_index].vfInfo[_address].info[_taskerInfo.taskIndex[q]].state;
            _fileIndexInfo[q].file = taskList[_index].vfInfo[_address].info[_taskerInfo.taskIndex[q]].file;
        }
        _taskerInfo.taskerinfo = _fileIndexInfo;
        return _taskerInfo;
    }
}