import {
  ApolloClient,
  DefaultOptions,
  InMemoryCache,
  gql
} from '@apollo/client'
const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore'
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all'
  }
}
const SUBQL_URL = import.meta.env.VITE_SUBQL_URL
const client = new ApolloClient({
  uri: SUBQL_URL,
  cache: new InMemoryCache(),
  defaultOptions: defaultOptions
})
export interface Mail {
  hash: string
  id: string
  timestamp: string
}
export interface Alias {
  alias: string
  id: string
  addr: { type: string; id: string; mailaddress: string }
  owner: { address: string; id: string }
}
type MailListRes = {
  data: {
    mails: {
      nodes: Mail[]
      totalCount: number
    }
  }
}
type AliasListRes = {
  data: {
    contacts: {
      nodes: Alias[]
      totalCount: number
    }
  }
}

export async function getSendList(id: string): Promise<MailListRes> {
  try {
    const rt = await client.query({
      query: gql`
        query queryMailList($fid: String!) {
          mails(filter: { fromId: { equalTo: $fid } }) {
            nodes {
              id
              from {
                id
                type
              }
              to {
                id
                type
              }
              hash
              timestamp
            }
            totalCount
          }
        }
      `,
      variables: { fid: id }
    })
    return rt
  } catch (e) {
    return {
      data: {
        mails: {
          nodes: [],
          totalCount: 0
        }
      }
    }
  }
}
export async function getMailList(id: string): Promise<MailListRes> {
  try {
    const rt = await client.query({
      query: gql`
        query queryMailList($toid: String!) {
          mails(filter: { toId: { equalTo: $toid } }) {
            nodes {
              id
              from {
                id
                type
              }
              to {
                id
                type
              }
              hash
              timestamp
            }
            totalCount
          }
        }
      `,
      variables: { toid: id }
    })
    return rt
  } catch (e) {
    return {
      data: {
        mails: {
          nodes: [],
          totalCount: 0
        }
      }
    }
  }
}
export async function getAliasList(id: string): Promise<AliasListRes> {
  try {
    const rt = await client.query({
      query: gql`
        query MyQuery2($oid: String!) {
          contacts(filter: { ownerId: { equalTo: $oid } }) {
            nodes {
              id
              owner {
                id
                address
              }
              addr {
                id
                type
                mailaddress
              }
              alias
            }
            totalCount
          }
        }
      `,
      variables: { oid: id }
    })
    return rt
  } catch (e) {
    return {
      data: {
        contacts: {
          nodes: [],
          totalCount: 0
        }
      }
    }
  }
}
