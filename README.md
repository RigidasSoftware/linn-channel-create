[![GitHub version](https://badge.fury.io/gh/RigidasSoftware%2Flinn-channel-create.svg)](https://badge.fury.io/gh/RigidasSoftware%2Flinn-channel-create)
[![npm version](https://badge.fury.io/js/linn-channel-create.svg)](https://badge.fury.io/js/linn-channel-create)
[![Build Status](https://travis-ci.org/RigidasSoftware/linn-channel-create.svg?branch=master)](https://travis-ci.org/RigidasSoftware/linn-channel-create)

_This documentation is a work in progress_


# Linnworks Create Channel Integration #

This project serves as an example for writing a fully functional integration between an eCommerce marketplace and [Linnworks.net](https://www.linnworks.net).

The sample marketplace being used in this project is the Create.net marketplace ([API Documentation](http://developers.create.net/API-Documentation)). The integration is fully functional and can therefore be considered a guideline.

## Writing your own integration ##

### Pre-requisites ###

To have your integration approved and hosted by Rigidas Software, the objects returned by its functions must conform to the structures defined in the [linn-channel-core](https://github.com/RigidasSoftware/linn-channel-core) package. These will be explained in further detail in the relevant sections below.

### Introduction ###

To be approved and hosted by us, an integration **must** allow the following from the given marketplace for a seller: 

* Downloading any **new** orders. _Orders that have been previously downloaded should ideally be ignored_
* Downloading a list of all active products/listings
* Updating the stock level of a given product/listing
* Marking a given order as shipped/despatched on the marketplace

While not necessary, it's highly desireable that the integration allows for: 

* Updating the price of a given product/listing

### Downloading Orders ###

_Incomplete_

### Downloading a list of products ###

linn-channel-core expects the integration to have a listProducts() function, whose response is of type [ListProductResults](https://github.com/RigidasSoftware/linn-channel-core/blob/master/ListProductsResult.js), which itself is a collection of [Product](https://github.com/RigidasSoftware/linn-channel-core/blob/master/Product.js).

An example of this can be seen [here](lib/create.js#L46).
