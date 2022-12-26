import { Injectable } from '@nestjs/common';
import * as C from './config';
// eslint-disable-next-line no-var, @typescript-eslint/no-var-requires
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: C.MYSQL_HOST,
  user: C.MYSQL_USER,
  password: C.MYSQL_PASSWORD,
  port: C.MYSQL_PORT,
  database: C.MYSQL_DATABASE,
  useConnectionPooling: true,
});

function getR(sql: string): Promise<any> {
  return new Promise((resolve) => {
    connection.query(sql, function (err: any, result: any) {
      if (err) {
        console.log('[SELECT ERROR] - ', err.message);
        resolve([]);
        return;
      }
      resolve(result);
    });
  });
}

@Injectable()
export class AppService {
  getAll(): Promise<any> {
    const sql = `SELECT * FROM soul`;
    return getR(sql);
  }
  check(address: string): Promise<any> {
    const sql = `SELECT * FROM soul WHERE address='${address}'`;
    return getR(sql);
  }
  update(d: C.P): Promise<any> {
    const sql = `UPDATE soul 
    SET DeFi='${d.DeFi}', GameFi='${d.GameFi}', NFT='${d.NFT}', Metaverse='${d.Metaverse}', OnChainData='${d.OnChainData}', total='${d.total}', uncliam='${d.uncliam}', cliamed='${d.cliamed}'
    WHERE address='${d.address}'`;
    return getR(sql);
  }
  add(d: C.P): Promise<any> {
    const sql = `INSERT INTO soul (DeFi,GameFi,NFT,Metaverse,OnChainData,address,total,uncliam,cliamed) 
    VALUES(${d.DeFi},${d.GameFi},${d.NFT},${d.Metaverse},${d.OnChainData},'${d.address}','${d.total}','${d.uncliam}','${d.cliamed}')`;
    return getR(sql);
  }
}
