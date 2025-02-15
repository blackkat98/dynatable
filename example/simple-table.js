const dt1 = new dynatable.DynaTable({
    containerId: 'table-container-1',
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
        source: [
            {
                year: 2020,
                sales: {
                    q1: 10000000,
                    q2: 12000000,
                    q3: 9000000,
                    q4: 15000000,
                },
            },
            {
                year: 2021,
                sales: {
                    q1: 10000000,
                    q2: 12000000,
                    q3: 9000000,
                    q4: 15000000,
                },
            },
            {
                year: 2022,
                sales: {
                    q1: 10000000,
                    q2: 12000000,
                    q3: 9000000,
                    q4: 15000000,
                },
            },
            {
                year: 2023,
                sales: {
                    q1: 10000000,
                    q2: 12000000,
                    q3: 9000000,
                    q4: 15000000,
                },
            },
            {
                year: 2024,
                sales: {
                    q1: 10000000,
                    q2: 12000000,
                    q3: 9000000,
                    q4: 15000000,
                },
            },
        ],
    },
})

dt1.draw()
