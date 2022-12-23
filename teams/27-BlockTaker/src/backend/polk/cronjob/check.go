package cronjob

import (
	"fmt"
	"github.com/robfig/cron"
	"polk-p2/define"
	"polk-p2/internal/utils"
	"tools/imail"
)

type Cron struct {
}

func (n *Cron) CronFunc() {
	//checkValidators()
	checkTxHashStatus()
}

func checkTxHashStatus() {
	c := cron.New()
	c.AddFunc("*/10 * * * * ?", func() {
		fmt.Println("检查交易状态")
		// check
		var res []define.ModelBonded
		if err := define.Db.Where("status == 0").Find(&res).Error; err == nil {
			for _, v := range res {
				data, _ := new(utils.SubScan).GetTxStatus(v.TxHash)
				if data.Success {
					define.Db.Where("tx_hash = ?", v.TxHash).Updates(&define.ModelBonded{Status: 1})
				}
			}
		}
	})
	c.Start()
}

func checkValidators() {
	c := cron.New()
	c.AddFunc("*/10 * * * * ?", func() {
		fmt.Println("检查验证者")
		// todo:check
		var res []define.ModelNominator
		if err := define.Db.Find(&res).Error; err == nil && len(res) > 0 {
			for _, v := range res {
				_, rank, _ := new(utils.Operate).MyNominator(v.StashAddress)
				if rank >= 256 {
					// send
					mail := imail.NewMail("smtp.163.com", "25", "Sivan", "dashingMy@163.com", "XZSSXOMEVFTYZMWQ")
					err := mail.Send([]string{"1056357064@qq.com"}, "智能推荐", "尊敬的用户您好！您的波卡提名人排名已经掉到256名之外，为了稳定收益，请尽快补仓保证排名在256名以内，如已处理，请忽略！", false)
					if err != nil {
						fmt.Printf("err:%v \n", err.Error())
					}
				}
			}
		}

	})
	c.Start()
}
