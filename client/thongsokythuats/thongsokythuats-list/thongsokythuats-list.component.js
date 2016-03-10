angular.module('angular-skynet').directive('thongsokythuatsList', function() {
    return {
        restrict: 'E',
        templateUrl: 'client/thongsokythuats/thongsokythuats-list/thongsokythuats-list.template.html',
        controllerAs: 'vm',
        controller: function($scope, $stateParams, skynetHelpers, $rootScope, iNotifier, skynetKendoGrid, $reactive) {

            $reactive(this).attach($scope);

            // ***************************************************
            // INITIALIZE
            // ***************************************************

            // Capture 'this contex - Refer to https://github.com/johnpapa/angular-styleguide#controlleras-with-vm
            let vm = this;

            vm._data = skynetHelpers.data;
            vm._helpers = skynetHelpers.helpers;
            vm._helpers.initNewThietBiParams(vm);
            
            vm._kData = skynetKendoGrid.thongsokythuats.data;
            vm._kHelpers = skynetKendoGrid.thongsokythuats.helpers;
            
            vm.pageOptions = {
                localData: {
                    thongsokythuats_config_data_filter: {}
                },
                isDisplayTopBar: true,
                isDisplayFullWidthGrid: false,
                topBarHeight: 'x1',
                filters: {
                    filterNhomId: '',            
                    nhomsFilterSource: [],
                    nhomsFilterActiveIds: [],
                },
                fabState: _.isEmpty(vm._helpers.validateUser('can_upsert_thong_so_ky_thuat')) ? 'thongsokythuats_createNew' : '',
                selected: {
                    thietbi: {},
                    thongsokythuat: {}
                },
                localConfigDataName: 'thongsokythuats_config_data_local',
                cloudConfigDataName: 'thongsokythuats_grid_config_data_skynet'
            };

            // LOAD LOCAL DATA
            try {
                let localData = JSON.parse(localStorage.getItem(vm.pageOptions.localConfigDataName));
                if (!_.isEmpty(localData)) {
                    console.log('dữ liệu được load từ cache (localData): ', localData)
            
                    vm.pageOptions.localData = angular.copy(localData);

                    vm.pageOptions.isDisplayTopBar = _.has(localData, 'isDisplayTopBar') ? localData.isDisplayTopBar : true;
                    vm.pageOptions.topBarHeight = (localData.topBarHeight) ? localData.topBarHeight : 'x1';
                    vm.pageOptions.isDisplayFullWidthGrid = _.has(localData, 'isDisplayFullWidthGrid') ? localData.isDisplayFullWidthGrid : true;
                    vm.pageOptions.filters.filterNhomId = (localData.filters.filterNhomId) ? localData.filters.filterNhomId : '';
                    vm.pageOptions.filters.nhomsFilterActiveIds = (localData.filters.nhomsFilterActiveIds) ? angular.copy(localData.filters.nhomsFilterActiveIds) : [];
                }        
            }
            catch(err) {
                iNotifier.error('Có lỗi xảy ra với cấu hình dữ liệu mà bạn đã lưu trên thiết bị này. Vui lòng reset theo các bước sau: Từ Menu > Dữ liệu > Giới hạn dữ liệu > Reset.');
            }

            console.log('dữ liệu được load từ cache (pageOptions): ', vm.pageOptions)


            kendo.pdf.defineFont({
                "Roboto": "/assets/fonts/DejaVuSans.ttf",
                "Roboto|Bold": "/assets/fonts/DejaVuSans-Bold.ttf",
                "Roboto|Bold|Italic": "/assets/fonts/DejaVuSans-Oblique.ttf",
                "Roboto|Italic": "/assets/fonts/DejaVuSans-Oblique.ttf"
            });

            vm.gridData = {
                kGrid: {
                    kData: {
                        dataSource: {
                            data: new kendo.data.ObservableObject([]),
                        }
                    },
                    kOptions: angular.copy(vm._kHelpers.initDefaultOptions()),
                    gridOnChange: function(event) {
                        let grid = $("#myGrid").data("kendoGrid");
                        if ((this.kOptions.selectable === 'row' || this.kOptions.selectable === 'cell') && grid.select().length)  {
                            vm.pageOptions.fabState = 'thongsokythuats_viewDetails';
                            vm.pageOptions.selected.thongsokythuat = grid.dataItem(grid.select());
                        }
                        console.log('selected: ', vm.pageOptions.selected.thongsokythuat);
                    },
                    gridOnDataBound: function(event) {
                        vm.pageOptions.fabState = _.isEmpty(vm._helpers.validateUser('can_upsert_thong_so_ky_thuat')) ? 'thongsokythuats_createNew' : '';
                        vm.pageOptions.selected.thongsokythuat = '';
                    }
                }
            }

            vm._kHelpers.initDefaultDataSource(vm.gridData.kGrid.kData.dataSource);

            // ***************************************************
            // UTILS
            // ***************************************************

            vm.utils = {
                setFilterByNhomId: function(id) {
                    vm.pageOptions.filters.filterNhomId = id;
                },
                buildNhomsFilterSource: function(source, selectedIds) {
                    if (source.length) {
                        if (selectedIds.length) {
                            _.each(source, (item) => {
                                if (_.contains(selectedIds, item._id)) 
                                    item.isActive = true;
                                else {
                                    if (!item.isActive)
                                        item.isActive = false;
                                }
                            });
                        } else {
                            _.each(source, (item) => {
                                item.isActive = true
                            });
                        } 
                        console.log('buildNhomsFilterSource: ', source);
                    }
                }
            }

            // ***************************************************
            // REACTIVE HELPERS
            // ***************************************************

            vm.helpers({
                nhomsSource: () => {
                    vm.pageOptions.filters.nhomsFilterSource = Nhoms.find({}, {sort: {order: 1}}).fetch();
                    vm.pageOptions.filters.nhomsFilterSource.unshift({_id: '', ten: "Tất cả"});
                    vm.utils.buildNhomsFilterSource(vm.pageOptions.filters.nhomsFilterSource, vm.pageOptions.filters.nhomsFilterActiveIds);

                    return Nhoms.find({}, {sort: {order: 1}});
                },
                thongsokythuats: () => {
                    vm.gridData.kGrid.kData.dataSource.data = (vm.pageOptions.filters.filterNhomId) ? ThietBis.find({
                        'thiet_bi.phan_loai.nhom.keyId': vm.pageOptions.filters.filterNhomId
                    }).fetch() : ThongSoKyThuats.find().fetch();
                    return ThongSoKyThuats.find({
                        'thiet_bi.phan_loai.nhom.keyId': vm.getReactively('pageOptions.filters.filterNhomId')
                    });
                }
            });


            // ***************************************************
            // METHODS
            // ***************************************************
            

            // ***************************************************
            // WATCHERS
            // ***************************************************

        }
    }
});
