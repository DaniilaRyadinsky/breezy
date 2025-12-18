
const d = duplicator([1,2,3,4,5])
console.log(d)

function duplicator(list) {
    return list.concat(list);
}

function introduce() {
        return `Меня зовут ${name}`;
    }