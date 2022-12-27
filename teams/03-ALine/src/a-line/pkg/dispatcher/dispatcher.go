package dispatcher

import (
	"github.com/hamster-shared/a-line/pkg/executor"
	"github.com/hamster-shared/a-line/pkg/model"
	"math/rand"
)

type IDispatcher interface {
	// DispatchNode 选择节点
	DispatchNode(job *model.Job) *model.Node
	// Register 节点注册
	Register(node *model.Node)
	// UnRegister 节点注销
	UnRegister(node *model.Node)

	// HealthcheckNode 节点心跳
	HealthcheckNode(node *model.Node)

	// SendJob 发送任务
	SendJob(job *model.JobDetail, node *model.Node)

	// CancelJob 取消任务
	CancelJob(job *model.JobDetail, node *model.Node)

	// GetExecutor 根据节点获取执行器
	// TODO ... 这个方法设计的不好，分布式机构后应当用api代替
	GetExecutor(node *model.Node) executor.IExecutor
}

type Dispatcher struct {
	Channel chan model.QueueMessage
	nodes   []*model.Node
}

func NewDispatcher(channel chan model.QueueMessage) *Dispatcher {
	return &Dispatcher{
		Channel: channel,
		nodes:   make([]*model.Node, 0),
	}
}

// DispatchNode 选择节点
func (d *Dispatcher) DispatchNode(job *model.Job) *model.Node {

	//TODO ... 单机情况直接返回 本地
	if len(d.nodes) > 0 {
		return d.nodes[0]
	}
	return nil
}

// Register 节点注册
func (d *Dispatcher) Register(node *model.Node) {
	d.nodes = append(d.nodes, node)
	return
}

// UnRegister 节点注销
func (d *Dispatcher) UnRegister(node *model.Node) {
	return
}

// HealthcheckNode 节点心跳
func (d *Dispatcher) HealthcheckNode(*model.Node) {
	// TODO  ... 检查注册的心跳信息，超过3分钟没有更新的节点，踢掉
	return
}

// SendJob 发送任务
func (d *Dispatcher) SendJob(job *model.JobDetail, node *model.Node) {

	// TODO ... 单机情况下 不考虑节点，直接发送本地
	// TODO ... 集群情况下 通过注册的ip 地址进行api接口调用

	d.Channel <- model.NewStartQueueMsg(job.Name, job.Id)

	return
}

// CancelJob 取消任务
func (d *Dispatcher) CancelJob(job *model.JobDetail, node *model.Node) {

	d.Channel <- model.NewStopQueueMsg(job.Name, job.Id)
	return
}

// GetExecutor 根据节点获取执行器
// TODO ... 这个方法设计的不好，分布式机构后应当用api代替
func (d *Dispatcher) GetExecutor(node *model.Node) executor.IExecutor {
	return nil
}

type HttpDispatcher struct {
	Channel chan model.QueueMessage
	nodes   []*model.Node
}

// DispatchNode 选择节点
func (d *HttpDispatcher) DispatchNode(job *model.Job) *model.Node {

	data := rand.Intn(len(d.nodes))
	return d.nodes[data]
}

// Register 节点注册
func (d *HttpDispatcher) Register(node *model.Node) {

}

// UnRegister 节点注销
func (d *HttpDispatcher) UnRegister(node *model.Node) {

}

// HealthcheckNode 节点心跳
func (d *HttpDispatcher) HealthcheckNode(node *model.Node) {

}

// SendJob 发送任务
func (d *HttpDispatcher) SendJob(job *model.JobDetail, node *model.Node) {

}

// CancelJob 取消任务
func (d *HttpDispatcher) CancelJob(job *model.JobDetail, node *model.Node) {

}

// GetExecutor 根据节点获取执行器
// TODO ... 这个方法设计的不好，分布式机构后应当用api代替
func (d *HttpDispatcher) GetExecutor(node *model.Node) executor.IExecutor {

	return nil
}
