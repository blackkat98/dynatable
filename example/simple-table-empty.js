const dt2 = new dynatable.DynaTable({
    containerId: 'table-container-2',
    tableClass: '',
    tableStyle: '',
    columns: [
        {
            label: 'No.',
            type: 'index',
            headerAlign: 'center',
        },
        {
            label: 'Year',
            prop: 'year',
            headerAlign: 'center',
            contentAlign: 'center',
        },
        {
            label: 'Sales',
            children: [
                {
                    label: v => v.map(el => `Quarter ${el}`),
                    prop: v => v.map(el => `sales.q${el}`),
                    iterateFrom: [ 1, 2, 3, 4 ],
                    headerAlign: 'center',
                }
            ],
            headerAlign: 'center',
        }
    ],
    datasource: {
        remote: false,
        source: [],
    },
})

dt2.draw()
