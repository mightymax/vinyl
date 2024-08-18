// @ts-check


/**
 * @typedef {import("./types").User} User
 */


class App {
  constructor() {

  }
  /**
   * 
   * @returns {Promise<User>}
   */
  async user() {
    return await fetch('/user').then(res => res.json())
  }

  /**
   * 
   * @param {number} [id]
   * @returns any[]
   */
  async collection(id) {
    return await fetch(`/collection${id?`/${id}`:''}`).then(res => res.json())
  }

  /**
   * 
   * @param {number} [id] 
   * @returns any[]
   */
  async wantlist(id) {
    return await fetch(`/wantlist${id?`/${id}`:''}`).then(res => res.json())
  }

  sort(key) {
    return (releaseA, releaseB) => {
      let a, b
      let v1 = 1
      let v2 = -1
      switch(key) {
        case 'artist':
          a = releaseA.basic_information.artists[0].name
          b = releaseB.basic_information.artists[0].name
          break;
        case 'year':
          a = releaseA.basic_information.year
          b = releaseB.basic_information.year
          break;
        case 'added':
          a = releaseA.date_added
          b = releaseB.date_added
          v1 = -1
          v2 = 1
          break;
        case 'title':
          a = releaseA.basic_information.title
          b = releaseB.basic_information.title
          break;
      }
      return a > b ? v1 : v2
    }   
  } 
  /**
   * 
   * @param {{releases: any[] | null, wants: any[]}} collection 
   * @param {*} collectionContainer 
   * @param {*} releaseModal 
   */
  renderCollection(collection, collectionContainer, releaseModal) {
    collectionContainer.innerHTML = ''
    for (const release of collection.releases??collection.wants) {
      const card = document.createElement('div')
      card.classList.add('col-6', 'col-sm-6', 'col-md-4', 'col-lg-3', 'col-xl-2')
      card.innerHTML = `
<div class="card mb-2" data-id="${release.id}">
<img src="/images/${release.id}.jpg" class="card-img-top" alt="Cover image ${release.basic_information.title}">
<div class="card-body">
<h2 class="fs-6 card-title">${release.basic_information.title}</h5>
<h3 class="fs-6"><em>${release.basic_information.artists[0].name}</em></h5>
</div>
</div>
      `
      collectionContainer.appendChild(card)
    }
    
    Array.from(collectionContainer.querySelectorAll('.card'))
      .forEach(card => {
        const modalTitle = document.querySelector('.modal-title')
        const spinner = document.querySelector('.spinner-border') ?? new HTMLElement()
        spinner.classList.remove('d-none')
        if(modalTitle!==null) modalTitle.innerHTML = 'Bezig met laden &hellip;'
        card.addEventListener('click', (ev) => {
          releaseModal.show()
            this.collection(ev.currentTarget.dataset.id).then(release => {
              if(modalTitle!==null) modalTitle.innerHTML = release.title
              const tbody = document.querySelector('tbody')
              const dl = document.querySelector('dl')
              if (tbody === null || dl === null) return
              tbody.innerHTML = ''
              dl.innerHTML = ''
              release.tracklist.map(track => {
                tbody.innerHTML += `<tr><th scope="row">${track.position}</th><td>${track.title}</td><td class="text-end">${track.duration}</td></tr>`
              })
              dl.innerHTML = `
              <dt class="col-sm-3">Uitgebracht</dt>
              <dd class="col-sm-9">${release.year}</dd>
              <dt class="col-sm-3">Genre</dt>
              <dd class="col-sm-9">${release.genres.join(', ')}</dd>
              <dt class="col-sm-3">Stijl</dt>
              <dd class="col-sm-9">${release.styles.join(', ')}</dd>
              <dt class="col-sm-3">Opmerkingen</dt>
              <dd class="col-sm-9"><small>${(release.notes??'-')}</small></dd>
              `
              spinner.classList.add('d-none')

            }
          )
        })
      })
  }

}
