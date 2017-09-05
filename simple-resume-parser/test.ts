import { ResumeParser, keyDescription, valueTrait } from './parser'
import { resumes } from './test-data'

for (let resume of resumes) {
    let parser = new ResumeParser(keyDescription, valueTrait, resume)
    console.log(parser.collected)
}
