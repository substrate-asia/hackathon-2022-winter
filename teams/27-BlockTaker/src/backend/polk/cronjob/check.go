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
		// check
		var res []define.ModelNominator
		if err := define.Db.Find(&res).Error; err == nil && len(res) > 0 {
			for _, v := range res {
				_, rank, _ := new(utils.Operate).MyNominator(v.StashAddress)
				if rank >= 256 {
					// send
					mail := imail.NewMail("smtp.163.com", "25", "Sivan", "dashingMy@163.com", "XZSSXOMEVFTYZMWQ")
					err := mail.Send([]string{"1056357064@qq.com"}, "BT Wallet", "Dear users, Hello! Your Polkadot nominee ranking has dropped below 256. In order to stabilize your income, please make up your position as soon as possible to ensure that your ranking is within 256. If it has been processed, please ignore it!", false)
					if err != nil {
						fmt.Printf("err:%v \n", err.Error())
					}
				}
			}
		}

	})
	c.Start()
}
