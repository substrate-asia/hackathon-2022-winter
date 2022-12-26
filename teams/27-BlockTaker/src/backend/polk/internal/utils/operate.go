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

	vnMap := make(map[string]int) //Verifier address: number of nominations
	vnMapLock := sync.Mutex{}     //concurrent lock
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

	//Traversing vnMap calculates how many times each verifier needs to request the interface through the number of nominators
	for valiAddr, count := range vnMap {
		cut := 100
		index := count / cut
		if count%cut > 0 {
			index++
		}

		var over bool

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
