// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ERC20Helper.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./interfaces/IWormholeFund.sol";

/**
 * Wormhole remote task Database
 * This is a simple task list, project manager can publish a task to remote one of his twitter
 * He need to depost some ERC20 token to this contract
 * Then we write into the reward list after the end time
 */
contract Task is Ownable, ReentrancyGuard, ERC20Helper {
    using EnumerableSet for EnumerableSet.UintSet;
    // task status:
    // Openning: when user create a new task;
    // Pending: when we fill the user list;
    // Closed: The task finished, token distribute to the users;
    // Clean: clear the list of rewardList
    enum TaskState {
        Openning,
        Pending,
        Closed,
        Clean
    }

    struct RewardInfo {
        address user;
        uint256 amount;
        uint256 twitterId;
    }

    uint256 constant BATCH_SIZE = 500;

    struct TaskInfo {
        uint256 endTime; // after this timestamp, the owner can change the state
        address owner; // who create this task
        address token; // the reward token
        uint256 amount; // reward amount
        TaskState taskState;
        uint256 id; // task id
        uint256 currentIndex; // user tags that are currently distributed
        uint256 topCount; // Define the number of top
        uint256 maxCount; // Maximum number of rewards
        uint256 feedTotal; // amount already filled
    }

    // all tasks id
    uint256[] public taskIds;
    EnumerableSet.UintSet private openningTaskIds;
    EnumerableSet.UintSet private pendingTaskIds;

    // all tasks list
    mapping(uint256 => TaskInfo) private taskList;
    mapping(uint256 => RewardInfo[]) private rewardList; // filled by wormhole

    // Fund contract
    IWormholeFund public fundContract;

    event NewTask(address indexed owner, address indexed token, uint256 amount, uint256 endTime);
    event AddReward(uint256 indexed taskId, address indexed contributor, uint256 amount);
    event Distribute(uint256 indexed id, uint256 count);
    event AdminFillTaskList(uint256 indexed id, uint256 count);
    event TaskStateChange(uint256 indexed id, uint8 state);

    constructor() {}

    function setFundContract(address fund) public onlyOwner {
        require(fund != address(0), "invalid fund address");
        fundContract = IWormholeFund(fund);
    }

    // create a new task
    // every one can create a task
    function newTask(
        uint256 id,
        uint256 endTime,
        address token,
        uint256 amount,
        uint256 topCount,
        uint256 maxCount
    ) public nonReentrant {
        require(taskList[id].endTime == 0, "Task has been created");
        require(ERC20(token).balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(endTime > block.timestamp, "Wrong end time");
        lockERC20(token, msg.sender, address(this), amount);

        taskList[id].endTime = endTime;
        taskList[id].owner = msg.sender;
        taskList[id].token = token;
        taskList[id].amount = amount;
        taskList[id].taskState = TaskState.Openning;
        taskList[id].id = id;
        taskList[id].topCount = topCount;
        taskList[id].maxCount = maxCount;

        taskIds.push(id);
        openningTaskIds.add(id);

        emit NewTask(msg.sender, token, amount, endTime);
    }

    function appendReward(uint256 id, uint256 amount) public nonReentrant {
        require(taskList[id].endTime > 0, "Task has not been created");
        require(ERC20(taskList[id].token).balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(taskList[id].taskState == TaskState.Openning, "Wrong task state");
        lockERC20(taskList[id].token, msg.sender, address(this), amount);
        taskList[id].amount += amount;
        emit AddReward(id, msg.sender, amount);
    }

    function cleanList(uint256 id, uint256 limit) public onlyOwner {
        require(taskList[id].id == id, "Invalid task id");
        require(taskList[id].currentIndex == 0, "can't be cleared");
        taskList[id].taskState = TaskState.Clean;
        pendingTaskIds.remove(id);
        uint256 len = limit;
        if (len >= rewardList[id].length) {
            len = rewardList[id].length;
        }
        while (len > 0) {
            rewardList[id].pop();
            len--;
        }
        if (rewardList[id].length == 0) {
            taskList[id].feedTotal = 0;
            taskList[id].taskState = TaskState.Openning;
            openningTaskIds.add(id);
        }
    }

    // Admin(wormhole) calculate the rewards list adn write into this contract batch by batch
    function commitList(
        uint256 id,
        address[] memory users,
        uint256[] memory amounts,
        uint256[] memory twitters,
        bool isLast
    ) public nonReentrant onlyOwner {
        require(taskList[id].endTime > 0, "Task has not been created");
        require(taskList[id].endTime < block.timestamp, "Task has not finish");
        require(taskList[id].taskState == TaskState.Openning, "Task is not opening");
        require(users.length == amounts.length, "Wrong data");
        require(users.length == twitters.length, "Wrong data");
        require(users.length <= BATCH_SIZE, "Batch limit exceeded");
        require(users.length + rewardList[id].length <= taskList[id].maxCount, "Exceeded the maximum number of participants");
        for (uint256 i = 0; i < users.length; i++) {
            rewardList[id].push(RewardInfo(users[i], amounts[i], twitters[i]));
            taskList[id].feedTotal += amounts[i];
        }
        require(taskList[id].feedTotal <= taskList[id].amount, "Invalid reward amount");
        if (isLast) {
            taskList[id].taskState = TaskState.Pending;
            openningTaskIds.remove(id);
            pendingTaskIds.add(id);
            emit TaskStateChange(id, uint8(TaskState.Pending));
        }
        emit AdminFillTaskList(id, users.length);
    }

    function redeem(uint256 id) public nonReentrant onlyOwner {
        require(taskList[id].endTime > 0, "Task has not been created");
        require(taskList[id].endTime < block.timestamp, "Task has not finish");
        require(taskList[id].taskState == TaskState.Openning, "Task is not opening");
        require(rewardList[id].length == 0, "Task has already been commitList");
        taskList[id].taskState = TaskState.Closed;
        openningTaskIds.remove(id);
        if (taskList[id].amount > 0) {
            releaseERC20(taskList[id].token, taskList[id].owner, taskList[id].amount);
        }
        emit TaskStateChange(id, uint8(TaskState.Closed));
    }

    // The task creator trigger the distribution batch by batch
    function distribute(uint256 id, uint256 _limit) public nonReentrant {
        // require(taskList[id].owner == msg.sender, 'You are not the task creator');
        require(taskList[id].id == id, "Invalid task id");
        require(taskList[id].taskState == TaskState.Pending, "Cant distribute the task that not in pending state");

        uint256 limit = _limit;
        if (limit > BATCH_SIZE) limit = BATCH_SIZE;
        uint256 index = taskList[id].currentIndex;
        uint256 distCount = 0;
        uint256 fundAmount = 0;

        for (; index < rewardList[id].length && distCount < limit; index++) {
            if (rewardList[id][index].user == address(0)) {
                fundContract.pushAward(rewardList[id][index].twitterId, taskList[id].token, rewardList[id][index].amount);
                // releaseERC20(taskList[id].token, address(fundContract), rewardList[id][index].amount);
                fundAmount += rewardList[id][index].amount;
            } else {
                releaseERC20(taskList[id].token, rewardList[id][index].user, rewardList[id][index].amount);
            }
            distCount++;
        }
        if (fundAmount > 0) {
            releaseERC20(taskList[id].token, address(fundContract), fundAmount);
        }

        taskList[id].currentIndex = index;
        emit Distribute(id, distCount);
        if (index >= rewardList[id].length) {
            taskList[id].taskState = TaskState.Closed;
            openningTaskIds.remove(id);
            pendingTaskIds.remove(id);
            if (taskList[id].amount - taskList[id].feedTotal > 0) {
                releaseERC20(taskList[id].token, taskList[id].owner, taskList[id].amount - taskList[id].feedTotal);
            }
            emit TaskStateChange(id, uint8(TaskState.Closed));
        }
    }

    // Get task's head info
    function taskInfo(uint256 id) public view returns (TaskInfo memory task, uint256 userCount) {
        task = taskList[id];
        userCount = rewardList[id].length;
    }

    function openningTasks() public view returns (uint256[] memory ids) {
        ids = openningTaskIds.values();
    }

    function pendingTasks() public view returns (uint256[] memory ids) {
        ids = pendingTaskIds.values();
    }

    function getRewardList(uint256 id, uint256 batch) public view returns (RewardInfo[] memory rewards) {
        TaskInfo storage task = taskList[id];
        uint256 batchSize = rewardList[id].length / BATCH_SIZE + (rewardList[id].length % BATCH_SIZE == 0 ? 0 : 1);
        if (task.taskState == TaskState.Openning || batch >= batchSize) {
            return rewards;
        }

        uint256 startIndex = batch * BATCH_SIZE;
        uint256 endIndex = batch == batchSize - 1 ? startIndex + (rewardList[id].length % BATCH_SIZE) : (batch + 1) * BATCH_SIZE;
        rewards = new RewardInfo[](endIndex - startIndex);
        uint256 j = 0;
        for (uint256 i = startIndex; i < endIndex; i++) {
            rewards[j] = rewardList[id][i];
            j += 1;
        }
    }
}
