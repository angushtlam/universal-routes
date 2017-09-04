import assert from 'assert'

import { route, routes, debugRouteMap, } from './index'

describe('route retrieval', () => {
  describe('should properly get top level route', () => {
    const urls = routes({
      root: route(() => '/'),
      register: route(() => '/register'),
      referral: route((props = { referralId: ':referralId' }) => (
        `/referral/${props.referralId}`
      )),
    })
  
    it('with no props', () => {
      assert.deepEqual(urls.root.get(), '/')
      assert.deepEqual(urls.register.get(), '/register')
    })
  
    it('with props but with no arguments provided', () => {
      assert.deepEqual(urls.referral.get(), '/referral/:referralId')
    })
  
    it('with props and arguments provided', () => {
      assert.deepEqual(urls.referral.get({ referralId: '1' }), '/referral/1')
      
      assert.deepEqual(
        urls.referral.get({ referralId: 'l33t' }),
        '/referral/l33t'
      )
    })

    /*
     * In the case where there are props for a route that take no props, it
     * should fall back safely with no special formatting on the current route.
     * This behavior is consistant for when there are valid props for a nested
     * route, because the props can replace any ones defined in the parent route
     */
    it('with props but no arguments provided', () => {
      assert.deepEqual(urls.root.get({ dummy: 'dummy' }), '/')
    })
  })

  describe('should properly get nested route', () => {
    const urls = routes({
      shop: route(() => '/shop', {
        category: route((props = { categoryId: ':categoryId', }) => (
          `/${props.categoryId}`
        )),
        coupons: route(() => '/coupons', {
          active: route(() => '/active', {
            view: route(() => '/view'),
          }),
        }),
        item: route((props = { itemId: ':itemId' }) => (
          `/item/${props.itemId}`
        ), {
          preview: route(() => '/preview'),
          variant: route((props = { variantId: ':variantId' }) => (
            `/${props.variantId}`
          )),
        }),
      }),
    })

    it('with no props provided', () => {
      assert.deepEqual(urls.shop.coupons.get(), '/shop/coupons')
      assert.deepEqual(urls.shop.coupons.active.get(), '/shop/coupons/active')
      assert.deepEqual(urls.shop.coupons.active.view.get(), '/shop/coupons/active/view')
    })
  
    it('with props but with no arguments provided', () => {
      assert.deepEqual(urls.shop.category.get(), '/shop/:categoryId')
      assert.deepEqual(urls.shop.item.preview.get(), '/shop/item/:itemId/preview')
    })
  
    it('with props and arguments', () => {
      assert.deepEqual(
        urls.shop.category.get({ categoryId: 'memes' }),
        '/shop/memes'
      )
    })

    it('with props defined in a parent route and no provided arguments', () => {
      assert.deepEqual(
        urls.shop.item.preview.get(),
        '/shop/item/:itemId/preview'
      )
    })

    it('with props defined in a parent route and arguments provided', () => {
      assert.deepEqual(
        urls.shop.item.preview.get({ itemId: '21' }),
        '/shop/item/21/preview')
    })
  })
})
