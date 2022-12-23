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
)
