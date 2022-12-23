package define

import (
	"golang.org/x/time/rate"
	"gorm.io/gorm"
	"time"
)

var (
	Db      *gorm.DB
	Limiter = rate.NewLimiter(rate.Every(time.Millisecond*200), 5)
)
