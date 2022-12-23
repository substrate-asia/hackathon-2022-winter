package utils

import (
	"polk-p2/define"
	"strconv"
	"strings"
	"sync"
	"tools/ihelp"
	"tools/ilog"
)

type Operate struct {
	subscan SubScan
}

func (t *Operate) MyNominator(stash string) (tarAddress string, nmRank int, nm256Bonded float64) {
	var data define.ModelNominator
	if err := define.Db.Where("stash_address = ?", stash).Find(&data).Error; err != nil {
		ilog.Logger.Error(err)
		return
	}

	vnMap := make(map[string]int) //验证者地址:提名数量
	vnMapLock := sync.Mutex{}     //并发锁
	validators := strings.Split(data.ValidatorAddress, ",")

	wg := sync.WaitGroup{}
	wg.Add(len(validators))

	for _, address := range validators {
		go func(address string) {
			defer ihelp.ErrCatch()
			defer wg.Done()
			validator, err := t.subscan.GetValidatorInfo(address)
			if err != nil {
				ilog.Logger.Error(address, err)
				return
			}
			vnMapLock.Lock()
			vnMap[address] = validator.CountNominators
			vnMapLock.Unlock()
		}(address)
	}
	wg.Wait()

	//遍历vnMap通过提名者数量计算出每个验证者需要请求几次接口
	for valiAddr, count := range vnMap {
		cut := 100
		index := count / cut
		if count%cut > 0 {
			index++
		}

		var over bool //是否终止

		wg = sync.WaitGroup{}
		wg.Add(index)

		for i := 0; i < index; i++ {
			go func(page int) {
				defer ihelp.ErrCatch()
				defer wg.Done()
				nominators, err := t.subscan.GetNominators(valiAddr, page, cut)
				if err != nil {
					ilog.Logger.Error(err)
					return
				}
				for _, n := range nominators {
					if n.RankNominator == 256 {
						bonded, _ := strconv.ParseFloat(n.Bonded, 64)
						nm256Bonded = ihelp.Decimal(bonded / 10000000000)
					}
					if n.NominatorStash == stash {
						tarAddress = valiAddr
						nmRank = n.RankNominator
						over = true
						return
					}
				}
			}(i)
		}

		wg.Wait()

		if over {
			return
		}
	}
	return
}
