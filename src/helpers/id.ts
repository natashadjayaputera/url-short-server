const ID_CHARACTER_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function generateRandomId(): string {
    // const length: number = 5 + Math.floor(Math.random() * 4)
    // let id = ''

    // for (let i = 0; i < length; i++){
    //     id = id + ID_CHARACTER_SET[Math.floor(Math.random() * ID_CHARACTER_SET.length)]
    // }

    
    // return id
    return new Array(5 + Math.floor(Math.random() * 4))
        .map(() => ID_CHARACTER_SET[Math.floor(Math.random() * ID_CHARACTER_SET.length)])
        .join('')
    
    // * NOTES
    // new Array(<length>)
    // .map --> what you do inside of for loop for each element
    // .join --> combine all the element
}

export function validateCustomId(id: string): boolean {
    // for (let i = 0; i < id.length; i ++){
    //     if (!ID_CHARACTER_SET.includes(id[i])) {
    //         return false
    //     }
    // }
    // return true
    return id.split('').every((char) => ID_CHARACTER_SET.includes(char))
}