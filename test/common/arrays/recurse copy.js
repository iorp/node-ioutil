const treeData = [
    {
        key: 'item1',
        isOpen: false,
        children: [
            {
                key: 'subItem1',
                isOpen: false,
                children: [
                    { key: 'subSubitem1', isOpen: false, children: [] },
                ],
            },
            { key: 'subitem2', isOpen: false, children: [] },
        ],
    },
    {
        key: 'item2',
        isOpen: false,
        children: [
            { key: 'subItem1', isOpen: false, children: [] },
            { key: 'subitem2', isOpen: false, children: [] },
        ],
    },
];

function recurse(data, callback) {
    return data.map(item => {
        const newItem = callback(item)||item;

        if (item.children && item.children.length > 0) {
            newItem.children = recurse(item.children, callback);
        }

        return newItem;
    });
}

// Example callback function: Add a property to each item, including children


 
 //  flattened key list
  recurse(treeData, (item) =>{  
     console.log(item.key); 
 });
 



// Update items recursively
const newTreeData = recurse(treeData, (item) =>{  
    return { ...item,   newProperty: 'new value',  };
});

  console.log(newTreeData);
