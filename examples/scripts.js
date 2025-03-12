dynatable({
    containerId: 'table-container-1',
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
    dataSource: {
        remote: false,
        source: Array.from(Array(14)).map((element, index) => ({
            year: 2000 + index,
            sales: {
                q1: 10000000 + (2000 + index) * 100,
                q2: 12000000 + (2000 + index) * 100,
                q3: 9000000 + (2000 + index) * 100,
                q4: 15000000 + (2000 + index) * 100,
            },
        })),
    },
})
