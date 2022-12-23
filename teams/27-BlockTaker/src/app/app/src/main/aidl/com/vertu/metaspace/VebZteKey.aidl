// VebZteKey.aidl
package com.vertu.metaspace;


interface VebZteKey {

    //  keyIndex 密钥索引 1-10 共10组



        /**
         * 导入公私密钥对
         * @return
         */
        boolean ImportKeyAll(in byte[] pubKey,in byte[] priKey,in int keyIndex);

        /**
         * 导入公密钥
         * @return
         */
        boolean ImportKeyPublic(in byte[] pubKey,in int keyIndex);

        /**
         * 导入私密钥
         * @return
         */
        boolean ImportKeyPrivate(in byte[] priKey,in int keyIndex);

        /**
         * 验签
         * @return
         */
        byte[] KeySign(in byte[] hash,in int keyIndex);

        /**
         * 加密
         * @return
         */
        byte[] Encrypt(in byte[] encryptData,in int keyIndex);

        /**
         * 解密
         * @return
         */
        byte[] Decrypt(in byte[] decryptData,in int keyIndex);


        /**
         * 测试  num +1000 返回
         * @return
         */
        int Test(in int num);



}