const ID_CHARACTER_SET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateRandomId(): string {
  // NOTES: IMPERATIVE APPROACH
  // const length: number = 5 + Math.floor(Math.random() * 4)
  // let id = ''

  // for (let i = 0; i < length; i++){
  //     id = id + ID_CHARACTER_SET[Math.floor(Math.random() * ID_CHARACTER_SET.length)]
  // }

  // return id

  // NOTES: DECLARATIVE APPROACH
  return new Array(5 + Math.floor(Math.random() * 4)).fill('')
    .map(
      () =>
        ID_CHARACTER_SET[Math.floor(Math.random() * ID_CHARACTER_SET.length)]
    )
    .join("");

  // * NOTES
  // new Array(<length>)
  // .map --> what you do inside of for loop for each element
  // .join --> combine all the element
}

export function validateCustomId(id: string): boolean {
  // NOTES: IMPERATIVE APPROACH
  // for (let i = 0; i < id.length; i ++){
  //     if (!ID_CHARACTER_SET.includes(id[i])) {
  //         return false
  //     }
  // }
  // return true

  // NOTES: DECLARATIVE APPROACH
  return id.split("").every((char) => ID_CHARACTER_SET.includes(char));
}
