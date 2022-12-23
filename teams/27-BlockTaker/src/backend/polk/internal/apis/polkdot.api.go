package apis

import (
	"github.com/gin-gonic/gin"
	"polk-p2/internal/utils"
	"tools/resp"
)

type ApiPolkdot struct {
	subScan utils.SubScan
}

func (t *ApiPolkdot) GetValidators(c *gin.Context) {
	var req getValidatorsReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(200, resp.Error(0, err))
		return
	}

	res, err := t.subScan.GetValidators(req.Balance)
	if err != nil {
		c.JSON(200, resp.Error(0, err))
		return
	}

	c.JSON(200, resp.Success(0, res))
}

func (t *ApiPolkdot) GetNominatorInfo(c *gin.Context) {
	var req getNominatorInfoReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(200, resp.Error(0, err))
		return
	}

	res, err := t.subScan.GetNominatorInfo(req.Address)
	if err != nil {
		c.JSON(200, resp.Error(0, err))
		return
	}

	c.JSON(200, resp.Success(0, res))
}

func (t *ApiPolkdot) GetValidatorInfo(c *gin.Context) {
	var req getValidatorInfoReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(200, resp.Error(0, err))
		return
	}

	res, err := t.subScan.GetValidatorInfo(req.StashAddress)
	if err != nil {
		c.JSON(200, resp.Error(0, err))
		return
	}

	c.JSON(200, resp.Success(0, res))
}
