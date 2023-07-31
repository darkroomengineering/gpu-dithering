import { enc } from 'crypto-js'
import AES from 'crypto-js/aes'
import { GraphQLClient } from 'graphql-request'
import { internalServerError, success } from 'libs/api/responses'

const query = `mutation createDiscount($basicCodeDiscount: DiscountCodeBasicInput!) {
  discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
    codeDiscountNode {
      id
      codeDiscount {
        ... on DiscountCodeBasic {
          startsAt
          endsAt
        }
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}`

async function client(query, variables) {
  try {
    const endpoint = ` https://${process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN}/admin/api/2023-01/graphql.json`
    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        'X-Shopify-Access-Token': process.env.NEXT_SHOPIFY_ADMIN_TOKEN,
        'Content-Type': 'application/json',
      },
    })
    return await graphQLClient.request(query, variables)
  } catch (error) {
    console.error(
      `There was a problem retrieving entries with the query ${query}`
    )
    console.error(error)
  }
}

function addDays(date, days) {
  date.setDate(date.getDate() + days)
  return date
}

const decryptId = (str) => {
  const decodedStr = decodeURIComponent(str)
  return AES.decrypt(decodedStr, 'apiSecret').toString(enc.Utf8)
}

async function Discount(req, res) {
  const hash = req.query.id
  const today = new Date()
  const showYourSelf = decryptId(hash).split('&')
  const token = showYourSelf[1].replace('token=', '')

  if (token !== 'this-is-legit')
    return res.status(403).json('you shall not pass')

  const code = `Store${Math.floor(today.valueOf() + Math.random())}`.slice(
    0,
    12
  )

  const config = {
    basicCodeDiscount: {
      title: 'Store win game discount',
      startsAt: today.toISOString().slice(0, 10),
      endsAt: addDays(today, 30).toISOString().slice(0, 10),
      code: code,
      usageLimit: 1,
      appliesOncePerCustomer: true,
      customerSelection: {
        all: true,
      },
      customerGets: {
        value: {
          percentage: 0.1,
        },
        items: {
          all: true,
        },
      },
    },
  }

  try {
    await client(query, config)
    success(res, { code })
  } catch (error) {
    internalServerError(res, error)
  }
}
export default Discount
