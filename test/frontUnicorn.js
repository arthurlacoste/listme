describe('Service: getlist', function () {

    // load the service's module
    beforeEach(module('listmeApp'));

    // instantiate service
    var serviceAjax, httpBackend, popularRequest;
    beforeEach(inject(function (_serviceAjax_, _$httpBackend_) {
        serviceAjax = _serviceAjax_;
        httpBackend = _$httpBackend_;
    }));

    it('Get a list', function () {
        serviceAjax.getList('BJ9oZRmEf');
        httpBackend.expectGET(getApiUrl() + '/get/BJ9oZRmEf').respond({});
        httpBackend.flush();
    });

});
