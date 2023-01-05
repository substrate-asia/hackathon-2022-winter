package define

import (
	"golang.org/x/time/rate"
	"gorm.io/gorm"
	"time"
)

var (
	//全局数据库对象
	Db *gorm.DB
	//限流器控制波卡接口并发允许1秒产生5个令牌
	Limiter = rate.NewLimiter(rate.Every(time.Millisecond*200), 5)
	//正式网波卡币比例
	//DotScale = 10000000000
	//正式网最大提名者
	//NominatorMax = 256
	//测试网波卡币比例
	DotScale = 1000000000000
	//测试网最大提名者
	NominatorMax = 64
)
