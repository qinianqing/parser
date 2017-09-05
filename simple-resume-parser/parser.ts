
//多种描述
type KeyDescription = { [index: string]: string[] }

//可能的值
type ValueTrait = { [index: string]: string[] }

//匹配项目
interface KeyMatch {
    key: string
    keyPosition: number
    keyWidth?: number
}

//候选人画像
interface Figure {
    [index: string]: string
}

export const keyDescription: KeyDescription = {
    name: ['姓名'],
    edu: ['学历/学位', '学历层次', '教育程度'],
    email: ['电子邮件', '电子邮箱', '邮箱'],
    phone: ['联系电话', '手机号码', '电话'],
    age: ['年龄'],
    college: ['学校'],
    sex: ['性别'],
    political: ['政治面貌']
}

export const valueTrait: ValueTrait = {
    edu: ['本科', '学士', '硕士', '博士'],
    sex: ['男', '女']
}

export class ResumeParser {

    collected: Figure

    constructor(
        private keyDescription: KeyDescription,
        private valueTrait: ValueTrait,
        private resume: string,
    ) {
        let cbk = this.collectByKey(this.keyDescription, this.resume)
        this.collected = this.collectAdditional(cbk, this.valueTrait, this.resume)
    }

    matchKey(key: string, resume: string): KeyMatch {
        let reg = key.split('').join('( *| *|\n*)*')
        let regExp = new RegExp(reg)
        let match = regExp.exec(resume)
        if (!match) { return { key, keyPosition: -1 } }
        let [keyPosition, keyWidth] = [match.index, match[0].length]
        return { key, keyPosition, keyWidth }
    }

    //去除冗余信息
    trim(s: string): string {
        return s
            .split('\n')[0].trim()
            .replace('：', '').trim()
            .replace(':', '').trim()
            .split(' ')[0].trim()
    }

    //收集可用的key，生成初步的信息
    collectByKey(keyDescription: KeyDescription, resume: string): Figure {
        let keyMap: KeyMatch[] = []
        for (let key of Object.keys(keyDescription)) {
            for (let keyName of keyDescription[key]) {
                let match = this.matchKey(keyName, resume)
                if (match.keyPosition !== -1) {
                    match.key = key
                    keyMap.push(match)
                    break
                }
            }
        }
        keyMap.sort((a, b) => a.keyPosition - b.keyPosition)
        let collected: Figure = {}
        for (let i = 0; i < keyMap.length - 1; i += 1) {
            let current = keyMap[i]
            let next = keyMap[i + 1]
            let part = resume.slice(current.keyPosition + current.keyWidth, next.keyPosition)
            collected[current.key] = this.trim(part)
        }
        if (!keyMap.length) { return collected }
        let last = keyMap[keyMap.length - 1]
        let part = resume.slice(last.keyPosition + last.keyWidth)
        collected[last.key] = this.trim(part)
        return collected
    }


    //尝试寻找额外信息
    collectAdditional(collected: Figure, valueTrait: ValueTrait, resume: string): Figure {
        for (let key of Object.keys(valueTrait)) {
            if (!collected[key]) {
                for (let trait of valueTrait[key]) {
                    if (resume.indexOf(trait) !== -1) {
                        collected[key] = trait
                    }
                }
            }
        }
        return collected
    }

}

