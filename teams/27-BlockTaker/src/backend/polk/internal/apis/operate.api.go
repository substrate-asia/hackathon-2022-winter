package apis

import (
	"errors"
	"github.com/gin-gonic/gin"
	"polk-p2/define"
	"polk-p2/internal/utils"
	"strings"
	"tools/resp"
)

type ApiOperate struct {
	operate utils.Operate
}

// 保存数据
func (t *ApiOperate) SaveNominator(c *gin.Context) {
	var req saveNominatorReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(200, resp.Error(0, err))
		return
	}

	if len(req.ValidatorAddress) == 0 {
		c.JSON(200, resp.Error(0, errors.New("请选择验证者")))
		return
	}
	var res define.ModelNominator
	if define.Db.Where("stash_address = ?", req.StashAddress).Find(&res).RowsAffected == 0 {
		if err := define.Db.Create(&define.ModelNominator{
			StashAddress:     req.StashAddress,
			ValidatorAddress: strings.Join(req.ValidatorAddress, ","),
		}).Error; err != nil {
			c.JSON(200, resp.Error(0, errors.New("信息保存失败")))
			return
		}
	} else {
		if err := define.Db.Where("stash_address = ?", req.StashAddress).Updates(&define.ModelNominator{
			StashAddress:     req.StashAddress,
			ValidatorAddress: strings.Join(req.ValidatorAddress, ","),
		}).Error; err != nil {
			c.JSON(200, resp.Error(0, errors.New("信息保存失败")))
			return
		}
	}

	c.JSON(200, resp.Success(0))
}

func (t *ApiOperate) CancelNominator(c *gin.Context) {
	var req cancelNominatorReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(200, resp.Error(0, err))
		return
	}
	if err := define.Db.Delete(&define.ModelNominator{}, "stash_address = ?", req.StashAddress).Error; err != nil {
		c.JSON(200, resp.Error(0, errors.New("信息删除失败")))
		return
	}
	c.JSON(200, resp.Success(0))
}

func (t *ApiOperate) NominatorOwnValidators(c *gin.Context) {
	var req cancelNominatorReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(200, resp.Error(0, err))
		return
	}
	var res define.ModelNominator
	if err := define.Db.Where("stash_address = ?", req.StashAddress).Find(&res).Error; err != nil {
		c.JSON(200, resp.Error(0, errors.New("信息删除失败")))
		return
	}
	c.JSON(200, resp.Success(0, gin.H{
		"data": res,
	}))
}

func (t *ApiOperate) FindNominator(c *gin.Context) {
	var req findNominatorReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(200, resp.Error(0, err))
		return
	}

	v1, v2, v3 := t.operate.MyNominator(req.StashAddress)
	c.JSON(200, resp.Success(0, gin.H{
		"vali_addr":      v1,
		"nominator_rank": v2,
		"nominator_256":  v3,
	}))
}

// 验证者排行
//func (t *ApiOperate) ValidatorRank(c *gin.Context) {
//	var req validatorsRankReq
//	if err := c.ShouldBind(&req); err != nil {
//		c.JSON(200, resp.Error(0, err))
//		return
//	}
//	res, err := t.operate.ValidatorRank(req.Balance)
//	if err != nil {
//		c.JSON(200, resp.Error(0, err))
//		return
//	}
//	c.JSON(200, resp.Success(0, res))
//}
