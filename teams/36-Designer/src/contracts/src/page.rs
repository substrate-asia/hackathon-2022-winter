use gstd::prelude::*;

#[derive(Debug, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct PageParam {
    pub page_num: u64,
    pub page_size: u64,
}

impl PageParam {
    pub fn find_index(&self, total: u64) -> (u64, u64) {
        if self.page_size == 0 {
            panic!("wrong page_size")
        }

        let start = (self.page_num - 1) * self.page_size;
        if start >= total {
            panic!("wrong page_num or page_size")
        }

        let mut end = start + self.page_size;
        if end > total {
            end = total
        }

        (start, end)
    }
}

#[derive(Debug, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct PageRet<T> {
    pub total: u64,
    pub pages: u64,
    pub page_num: u64,
    pub page_size: u64,
    pub data: Vec<T>,
}

impl<T> PageRet<T> {
    pub fn new(param: PageParam, total: u64, data: Vec<T>) -> Self {
        let mut pages = total / param.page_size;
        if total % param.page_size > 0 {
            pages += 1;
        }
        PageRet {
            total,
            pages,
            page_num: param.page_num,
            page_size: param.page_size,
            data,
        }
    }
}
