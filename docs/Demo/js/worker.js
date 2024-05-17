addEventListener('message', ({ data }) => {
    console.log(data)
    postMessage('hi')
    for (let i = 0; i < 100; i++) {
        console.log('worker:', i)
    }
})