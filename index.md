# Web Developer Resources

## Introduction

<br>

This is a biased compilation of technologies that are useful to learn in order to get a job as a web developer. It is in my opinion the smallest set of technologies you need to know about in order to work on the full stack of a website. Deployment will be avoided in this document since it is out of the strict scope of *developer* guide. Since most people use Windows, this guide will assume use Windows. I suggest, if possible and you're interested, using WSL2 in order to have a mostly Linux development environment, or just using Linux or Mac. All the technologies in this document work natively on all platforms, so using Windows is absolutely fine for all of our purposes.


## Summary

- List of Technologies in order and Explanation
- Setting up the Development Environment
- Typescript
- Quick NodeJS explanation
- HTML and CSS
- Frameworks


<br>

### List of technologies in order and Explanation

<br>

This document will start with setting up a development environment. It will be the quickiest to set up, free, easy to use and very light. I suggest starting with VScode, for its flexibilty, lightness, and extensibility.
The "necessary" extension are few and work pretty well out of the box.

Then I think at least a bit of familiarity with programming in general will be useful, so I'd start with Typescript. Why Typescript? Well, the smallest stac of technologies in order to make a modern website at this point in time is:


- HTML because it's literally how your write the visible part of the website
- CSS because it makes your HTML pretty
- JavaScript because it makes your website interactive
- Also JavaScript using NodeJS which makes the backend for your website


Additionally I would start getting familiar with at least one of the major frontend frameworks because learning them teaches you a lot of how you build the frontend of a website.

But JavaScript will teach you bad habits, and  learning how languages use static typechecking will turn out useful if you want to get to other, more performant backend languages in the future. So TypeScript is perfect for that, when learning it you learn JavaScript too, but you get type checking, also most frameworks support it almost natively and it is much better if you work in a team.



### Setting up the Development Environment

<br>

First of all, let's setup our development environment. If you already have this setup for any reason, feel free to ignore me.
I'll offer a free option and a paid option.

As far as paid options go, WebStorm is though to beat. It also comes with pretty much everything included so you wouldn't need all the plugins and other stuff I'll mention later. On the other hand, having a good development environment doesn't really need the paid software.


#### VSCode

VSCode,short for Visual Studio Code, is an Electron App, which means that it's basically a webpage in a bundled browser. You don't really need to know that, just know that it's free, it runs the same on basically any platform, it's pretty lightweight. 

For anyone interested, while it is Open Source, the downloadable executable is actually proprietary software. You can find online the open source version https://github.com/Microsoft/vscode , but you'll have to build it yourself from source, or download it from here https://github.com/VSCodium/vscodium. Also it has worse support for the marketplace and extensions. It's a shame, but that's kinda how it is.

https://code.visualstudio.com/


Once you've downloaded VSCode I suggest you download a couple of extension from the marketplace:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [JavaScript and TypeScript Nightly](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)


Just search them in the marketplace on the VSCode sidebar
And then you're good to go. More or less.

VSCode has a lot of web dev tools from the beginning. If working in a team I suggest also getting [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)

#### Git

While not *technically* a necessity while doing these exercises, learning how to use git at least a little is fundamental when working as a developer.

So, first af all make an account on [Github](https://github.com) if you don't have one. If you're not familiar with git, I'd suggest downloading the [Desktop App](https://desktop.github.com/) too.

Just to keep it short, git is a version control system. So basically you make a website or any kind of coding project but you don't make all in once right? Well let's say you have a session of coding, then what you do is bundle all your edits you did in that session which you then *commit* to the project, and the *push* online on the repository. Want to branch out and experiment on stuff? No worries, make a new git *branch* and all your commits go there, so they don't ruin your main branch. Got a big error in your code. You can look at all the commits, know which one ruined everything, or if you know it's the last one, you may as well revert it. More than one person is working on a project? Well you know exactly who did what, it's all in the commits history.

If you want to know more about git you can check it out [here](https://git-scm.com/about)

### Typescript

Now, first of all, if you want to be a web developer, you should know at least a bit how to program. As far as I'm concerned, learn whatever you prefer, Python is pretty easy and has a lot of tutorials for example. But you'll have to learn JavaScript eventually, and while doing that, I'd say it's better to learn TypeScript. Also it's mandatory if you choose later to use Angular as a frontend framework. But I'm getting ahead of myself. 

Now, I won't teach you TypeScript here, but I will give you a few pointers

In order to learn Typescript you'll have to use the [Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
But I'd start from the [here](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)

Then you'll want to run it. To run it locally, you'll need NodeJS, which I'll get into in the next chapter.

Just know that you can download it [here](https://nodejs.org/en/)

Follow the installation steps after reading the chapter on NodeJS. For now, just keep reading.
After you have that you can use typescript following the instructions you find [here](https://www.typescriptlang.org/download)


While learning TypeScript, in order to try stuff out make use of the [playground](https://www.typescriptlang.org/play) which has example to try and will run your code without you needing to setup anything

And that's about it for TypeScript
### Quick NodeJS explanation


### HTML and CSS


### Frameworks
