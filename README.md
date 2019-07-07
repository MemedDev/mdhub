# MdHub

> A javascript library to create micro front-end applications

<p align="center"><img src="https://user-images.githubusercontent.com/2197005/60761959-86abfe00-a02a-11e9-85a7-dc76f77a695c.png" alt="mdhub" /></p>

## Install

You can get it on npm.

```
npm install mdhub --save
```

## Why

`MdHub` was created in 2015, when [Memed](https://memed.com.br) faced a challenge building the new version of its SPA (Single Page Application):

> We need to integrate some "screens" of our new SPA on third-party SPAs, something like `modules` (Memed CTO, 2015)

Some requirements was listed:

1. Avoid CSS conflict
2. Avoid JS libraries conflict
3. Easy to use
4. Only load what will be used

Putting the SPA into an `iframe` solves the problems with CSS/JS conflicts. 

To be easy to use, a JS Library can be made to create the `iframe` and exposes some methods to communicate with it using `postMessage`.

To only load what will be used, the SPA can have custom compilations (one for each third-party SPA), but will be hard to mantain. Other solution was to split the SPA into `modules`, and create an `iframe` for each module - this is what `MdHub` does and why it was created.

`MdHub` takes care of:

- Creating an `iframe` for each module
- `iframe` styling
- Communication between each module using commands and events (something like CQRS/ES) over `postMessage`
- `iframe` displaying control (show or hide a module)
- Management of modules dependencies (if `module.one` depends on `module.two`, `MdHub` will load it automatically)

## Micro front-end is good?

Yes, but it's not a silver bullet. Some advantages:

- Isolation (if a module breaks, other modules can continue working)
- Follows the Single Responsibility Principle
- Separate deployment
- Separate development (team autonomy)
- Easy to use different frameworks/libraries

Some references:

- [What are Micro Frontends?](https://micro-frontends.org/)
- [awesome-micro-frontends](https://github.com/rajasegar/awesome-micro-frontends)
- [Understanding Micro Frontends](https://hackernoon.com/understanding-micro-frontends-b1c11585a297)
- [My experience using micro frontends](https://medium.com/passionate-people/my-experience-using-micro-frontends-e99a1ad6ed32)
- [3 tips for scaling large Vue.js application](https://dev.to/maxpou/3-tips-for-scaling-large-vuejs-application-2edi)
- [Slides from Usabilla - Micro Frontends](https://www.slideshare.net/spyrosioakeimidis/micro-frontends-86962142)
- [Thoughtworks Technology Radar - Micro frontends - Adopt!](https://www.thoughtworks.com/radar/techniques/micro-frontends)
- [Ask HN: What do you use to build micro-front ends?](https://news.ycombinator.com/item?id=13009285)

## Special Thanks

Thank you for all the contributors of versions 1 and 2: Danilo Santos, Gabriel Couto, Cloves Santos, João Sales, Felipe Sousa, Rômulo Argolo, William Espindola, Carlos Júnior.

## License

[MIT](LICENSE).
