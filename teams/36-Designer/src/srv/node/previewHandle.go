package node

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/CESSProject/cess-oss/pkg/chain"
	"github.com/CESSProject/cess-oss/pkg/erasure"
	"github.com/gin-gonic/gin"
)

func (n *Node) previewHandle(c *gin.Context) {
	getName := c.Param("fid")

	// local cache
	fpath := filepath.Join(n.FileDir, getName)
	_, err := os.Stat(fpath)
	if err == nil {
		c.Writer.Header().Add("Content-Disposition", fmt.Sprintf("attachment; filename=%v", getName))
		c.Writer.Header().Add("Content-Type", "application/octet-stream")
		c.File(fpath)
		return
	}

	// file meta info
	fmeta, err := n.Chain.GetFileMetaInfo(getName)
	if err != nil {
		if err.Error() == chain.ERR_Empty {
			c.JSON(404, "NotFound")
			return
		}
		c.JSON(500, "InternalError")
		return
	}

	if string(fmeta.State) != chain.FILE_STATE_ACTIVE {
		c.JSON(403, "BackingUp")
		return
	}

	r := len(fmeta.BlockInfo) / 3
	d := len(fmeta.BlockInfo) - r
	down_count := 0
	for i := 0; i < len(fmeta.BlockInfo); i++ {
		// Download the file from the scheduler service
		fname := filepath.Join(n.FileDir, string(fmeta.BlockInfo[i].BlockId[:]))
		if len(fmeta.BlockInfo) == 1 {
			fname = fname[:(len(fname) - 4)]
		}
		mip := fmt.Sprintf("%d.%d.%d.%d:%d",
			fmeta.BlockInfo[i].MinerIp.Value[0],
			fmeta.BlockInfo[i].MinerIp.Value[1],
			fmeta.BlockInfo[i].MinerIp.Value[2],
			fmeta.BlockInfo[i].MinerIp.Value[3],
			fmeta.BlockInfo[i].MinerIp.Port,
		)
		err = n.downloadFromStorage(fname, int64(fmeta.BlockInfo[i].BlockSize), mip)
		if err != nil {
			n.Logs.Downfile("error", fmt.Errorf("[%v] Downloading %drd shard err: %v", c.ClientIP(), i, err))
		} else {
			down_count++
		}
		if down_count >= d {
			break
		}
	}

	err = erasure.ReedSolomon_Restore(n.FileDir, getName, d, r, uint64(fmeta.Size))
	if err != nil {
		n.Logs.Downfile("error", fmt.Errorf("[%v] ReedSolomon_Restore: %v", c.ClientIP(), err))
		c.JSON(500, "InternalError")
		return
	}

	if r > 0 {
		fstat, err := os.Stat(fpath)
		if err != nil {
			c.JSON(500, "InternalError")
			return
		}
		if uint64(fstat.Size()) > uint64(fmeta.Size) {
			tempfile := fpath + ".temp"
			copyFile(fpath, tempfile, int64(fmeta.Size))
			os.Remove(fpath)
			os.Rename(tempfile, fpath)
		}
	}

	c.Writer.Header().Add("Content-Disposition", fmt.Sprintf("attachment; filename=%v", getName))
	c.Writer.Header().Add("Content-Type", "application/octet-stream")
	c.File(fpath)
}
