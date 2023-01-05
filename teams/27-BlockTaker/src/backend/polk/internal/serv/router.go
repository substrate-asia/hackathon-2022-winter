package serv

import (
	"github.com/gin-gonic/gin"
	"polk-p2/internal/apis"
)

type Router struct {
	middleware Middleware
	apiPolkdot apis.ApiPolkdot
	apiOperate apis.ApiOperate
	apiStake   apis.ApiStake
}

func (t *Router) setRouter(r *gin.Engine) {
	g := r.Group("polkdot")
	{
		g = g.Group("v1")
		{
			g.GET("validators", t.apiPolkdot.GetValidators)
			g.GET("nominator_info", t.apiPolkdot.GetNominatorInfo)
			g.GET("validator_info", t.apiPolkdot.GetValidatorInfo)
		}
	}

	g = r.Group("operate")
	{
		g = g.Group("v1")
		{
			g.POST("save_nominator", t.apiOperate.SaveNominator)
			g.GET("cancel_nominator", t.apiOperate.CancelNominator)
			g.GET("find_nominator", t.apiOperate.FindNominator)
			//g.GET("validator_rank", t.apiOperate.ValidatorRank)
		}
	}

	g = r.Group("staking")
	{
		g = g.Group("v1")
		{
			g.POST("save", t.apiStake.SaveStake)
			g.GET("get_amount", t.apiStake.GetStake)
			g.GET("del_amount", t.apiStake.DelWithdrawBonded)
		}
	}
}
