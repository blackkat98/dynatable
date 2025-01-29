const { DynaTable } = dynatable

const dt1 = new DynaTable({
    containerId: 'table-container-1',
    columns: [
        {
            label: 'Ord. No.',
        },
        {
            label: 'Sales',
            children: [
                {
                    label: v => v.map(el => `M${el}`),
                    labelDatasource: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
                }
            ],
        }
    ],
})

dt1.draw()
