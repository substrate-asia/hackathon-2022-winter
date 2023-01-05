package apis

import (
	"errors"
	"github.com/gin-gonic/gin"
	"polk-p2/define"
	"polk-p2/internal/utils"
	"time"
	"tools/resp"
)

type ApiStake struct {
	subScan utils.SubScan
}

func (a *ApiStake) SaveStake(c *gin.Context) {
	var req saveUnbondedReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(200, resp.Error(0, err))
		return
	}
	if err := define.Db.Create(&define.ModelBonded{
		StashAddress: req.StashAddress,
		Amount:       req.Amount,
		TxHash:       req.TxHash,
		Status:       0,
	}).Error; err != nil {
		c.JSON(200, resp.Error(0, errors.New("info save failed")))
		return
	}
	c.JSON(200, resp.Success(0))
	return
}

func (a *ApiStake) GetStake(c *gin.Context) {
	var req findUnbondNumsReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(200, resp.Error(0, err))
		return
	}
	var res []define.ModelBonded
	if err := define.Db.Where("stash_address = ? and status = 1", req.StashAddress).Find(&res).Error; err != nil {
		c.JSON(200, resp.Error(0, errors.New("info save failed")))
		return
	}
	total := "0"
	for _, v := range res {
		if time.Now().After(time.Unix(int64(v.CreatedAt), 0).Add(12 * time.Hour)) {
			total = utils.Add(total, v.Amount)
		}
	}
	c.JSON(200, resp.Success(0, gin.H{
		"amount": total,
	}))
}

func (a *ApiStake) DelWithdrawBonded(c *gin.Context) {
	var req delUnBondReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(200, resp.Error(0, err))
		return
	}
	t := time.Now().Add(-12 * time.Hour).Unix()
	if err := define.Db.Where("created_at <= ? and stash_address = ? and status = 1", t, req.StashAddress).Delete(&define.ModelBonded{}).Error; err != nil {
		c.JSON(200, resp.Error(0, errors.New("info delete failed")))
		return
	}
	c.JSON(200, resp.Success(0))
}
