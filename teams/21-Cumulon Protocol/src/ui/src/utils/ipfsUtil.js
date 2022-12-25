import request from "@/utils/request";

const ipfs_node = "https://kodadot.mypinata.cloud/";
const ipfs_prefix = "ipfs://";
const ipfs_temp_cache_map = {};
const ipfs_temp_cache_max_count = 1000;
async function buildImage(params) {
    // console.log(params);
    let content = "";
    content += params.name || params.id;
    content += "<br>";
    if (params && params.data) {
        //metadata: "ipfs://ipfs/bafkreibtsbqelnf2tnjiriq22hbkmoy7cte4cjs5gte5gfwxdjqdiqk3se"
        // src: "ipfs://ipfs/QmZy8eRLhToqPk5154SJkTJfPD8AMnPAjBi6w1S61yNPrR/1F194/1F194_Necklace.svg"
        // ==> https://kodadot.mypinata.cloud/ipfs/QmZy8eRLhToqPk5154SJkTJfPD8AMnPAjBi6w1S61yNPrR/var3/var3_background.svg
        //
        let ipfs_metadata = params.data.src || params.data.metadata || '';
        if (!ipfs_metadata) {
            return;
        }

        let metadata = new String(ipfs_metadata.toString());

        if (metadata.startsWith(ipfs_prefix)) {
            let path = ipfs_node + metadata.replace(ipfs_prefix, "");

            if (ipfs_temp_cache_map[path]) {
                console.log("hit cache, path=", path);
                let ipfsData = ipfs_temp_cache_map[path];
                content += buildHtmlContent(ipfsData);
            } else {
                console.log("request ipfs, path=", path);
                let response = await request({
                    url: path,
                    method: 'get'
                });
                console.log(response);
                let ipfsData = response || {};
                checkIpfsCache();
                ipfs_temp_cache_map[path] = ipfsData;
                content += buildHtmlContent(ipfsData);
            }

        }
    }
    return content;
}

function buildHtmlContent(d) {
    if (d.image) {
        let imagePath = ipfs_node + d.image.replace(ipfs_prefix, "");
        return `<img class='ipfs-nft-img' src='${imagePath || ''}'><div class='ipfs-nft-desc'>${d.description || ''}</div>`;
    } else {
        return `<div class='ipfs-nft-desc'>${d.description || ''}</div>`;
    }
}

function checkIpfsCache() {
    if (Object.keys(ipfs_temp_cache_map).length > ipfs_temp_cache_max_count) {
        ipfs_temp_cache_map = {};
    }
}

async function getIpfsPath(nft_resources, nft_metadata) {

    let ipfs_path = '';
    if (nft_resources && nft_resources.length > 0) {
        // resources => resources[0]=> metadata => json => thumb : "ipfs://ipfs/bafkreibtsbqelnf2tnjiriq22hbkmoy7cte4cjs5gte5gfwxdjqdiqk3se"
        // ==> https://kodadot.mypinata.cloud/ipfs/bafkreibtsbqelnf2tnjiriq22hbkmoy7cte4cjs5gte5gfwxdjqdiqk3se
        let resource = nft_resources[0];
        if (resource.metadata) {
            let metadata = JSON.parse(resource.metadata);
            if (metadata.thumb) {
                ipfs_path = ipfs_node + metadata.thumb.replace(ipfs_prefix, "");
                return ipfs_path;
            }
        }
    }
    else {
        if (nft_metadata) {
            //"ipfs://ipfs/bafkreibbleepkbga347lawkx4x64u3yn32zdabsgmiifemqmoxsdbwwnpq"
            // =>  
            //  {
            // 	"description": "This Second Rate Clown makes a fantastic selection of tapas in a traditional style, it likes nothing more than a long siesta and working late into the evening ",
            // 	"name": "Espanyol",
            // 	"attributes": [],
            // 	"image": "ipfs://ipfs/bafkreihn5t4ipnssmpoywa5m6ta5kvkycyglkw6mq444su3zaety2q54la"
            // }
            let request_path = ipfs_node + nft_metadata.replace(ipfs_prefix, "");
            let response = await request({
                url: request_path,
                method: 'get'
            });
            // console.log(response);
            if (response && response.image) {
                ipfs_path = ipfs_node + response.image.replace(ipfs_prefix, "");
            }

        }
    }
    return ipfs_path || '';
}
export default {
    buildImage,
    getIpfsPath
}