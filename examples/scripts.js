const table1 = dynatable({
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
                },
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

const table2 = dynatable({
    containerId: 'table-container-2',
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
                },
            ],
            headerAlign: 'center',
        }
    ],
    dataSource: {
        remote: false,
        source: [],
    },
})

const table3 = dynatable({
    containerId: 'table-container-3',
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
                },
            ],
            headerAlign: 'center',
        }
    ],
    dataSource: {
        remote: false,
        source: Array.from(Array(30)).map((element, index) => ({
            year: 2000 + index,
            sales: {
                q1: 10000000 + (2000 + index) * 100,
                q2: 12000000 + (2000 + index) * 100,
                q3: 9000000 + (2000 + index) * 100,
                q4: 15000000 + (2000 + index) * 100,
            },
        })),
        pagination: {
            show: true,
            page: 1,
            perPage: 10,
            perPageOptions: [ 10, 20, 50, 100, 200 ],
        },
    },
})

const mockApi = async (params) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const page = (
                !isNaN(Number(params.page)) && 
                Number(params.page) >= 1 && 
                Math.floor(Number(params.page))
            ) || 1
            const perPage = (
                Number(params.perPage) && 
                !isNaN(Number(params.perPage)) && 
                Math.floor(Number(params.perPage)) >= 10 && 
                Math.floor(Number(params.perPage)) <= 1000
            ) ? Math.floor(Number(params.perPage)) : 10
            const filter = (params.filter || '').trim()
            let list = Array.from(Array(300)).map((element, index) => ({
                year: 2000 + index,
                sales: {
                    q1: 10000000 + (2000 + index) * 100,
                    q2: 12000000 + (2000 + index) * 100,
                    q3: 9000000 + (2000 + index) * 100,
                    q4: 15000000 + (2000 + index) * 100,
                },
            }))
            
            if (filter) list = list.filter(el => String(el.year).includes(filter))
            
            resolve({
                data: list.slice(perPage * (page - 1), perPage * page),
                meta: { page, perPage, total: list.length, totalPages: Math.ceil(list.length / perPage) },
            })
        }, 3000)
    })
}
const tbl3_Data = table3.getData()
console.log(tbl3_Data)

const table4 = dynatable({
    containerId: 'table-container-4',
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
                },
            ],
            headerAlign: 'center',
        }
    ],
    dataSource: {
        remote: true,
        source: mockApi,
        sourceMap: {
            request: {
                page: 'page',
                perPage: 'perPage',
                filter: '',
            },
            response: {
                data: 'data',
                'meta.total': 'total',
                'meta.totalPages': 'totalPages',
            },
        },
        pagination: {
            show: true,
            page: 1,
            perPage: 10,
            perPageOptions: [ 10, 20, 30, 50, 100, 200 ],
        },
    },
})

const table5 = dynatable({
    containerId: 'table-container-5',
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
                },
            ],
            headerAlign: 'center',
        }
    ],
    dataSource: {
        remote: false,
        source: Array.from(Array(30)).map((element, index) => ({
            year: 2000 + index,
            sales: {
                q1: 10000000 + (2000 + index) * 100,
                q2: 12000000 + (2000 + index) * 100,
                q3: 9000000 + (2000 + index) * 100,
                q4: 15000000 + (2000 + index) * 100,
            },
        })),
        pagination: {
            show: true,
            page: 1,
            perPage: 10,
            perPageOptions: [ 10, 20, 50, 100, 200 ],
        },
        select: [],
    },
})
