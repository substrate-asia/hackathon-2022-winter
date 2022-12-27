pragma solidity ^0.8.0;


contract SimpleDid {

     mapping (address => Document) public DID;  


    struct Document{
        string methodString ;
        string puk;
    }
     

    // event add(address indexed from, uint256 value);

    function mint(string  memory methodString,string memory puk) public  {
         _mint(methodString,puk);

    }

    function _mint(string memory methodString,string memory puk) internal{
    
        DID[msg.sender] = Document({methodString:methodString,puk:puk });
    }


}
