module.exports = [
    {
        id: '1',
        image: 'hue',
        type: 'menu',
        title: 'All Lights',
        deviceName:'All Lights',
        device_type: ['light', 'rgbled', 'rgbled8'],
        x: 1,
        y: 1
    },

    {
        id: '10',
        image: 'color_picker',
        title: 'Red',
        type: 'action',
        widget: 'light',
        state: 'FF0000',
        deviceName:'All Lights',
        parent: '1',
        x: 1,
        y: 0
    },
    {
        id: '11',
        image: 'color_picker',
        title: 'Green',
        type: 'action',
        widget: 'light',
        state: '00FF00',
        deviceName:'All Lights',
        parent: '1',
        x: 2,
        y: 0
    },
    {
        id: '12',
        image: 'color_picker',
        title: 'Blue',
        type: 'action',
        widget: 'light',
        state: '0000FF',
        deviceName:'All Lights',
        parent: '1',
        x: 0,
        y: 0
    },
    {
        id: '16',
        image: 'hue',
        type: 'action',
        widget: 'light',
        state: '#FFFFFF',
        title: 'Turn On',
        deviceName:'All Lights',
        parent: 1,
        x: 2,
        y: 1
    },
    {
        id: '15',
        image: 'hue_off',
        type: 'action',
        widget: 'light',
        state: '#000000',
        title: 'Turn Off',
        deviceName:'All Lights',
        parent: 1,
        x: 0,
        y: 1
    }
];
